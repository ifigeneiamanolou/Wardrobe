from fastapi.security import OAuth2PasswordBearer
from src.services.database import find_user, load_cluster
from src.models.pydantic import TokenData
from src.config.conf import secret_key
from pwdlib import PasswordHash
from datetime import timedelta, timezone, datetime
import jwt
from jwt.exceptions import InvalidTokenError, PyJWTError
from fastapi import HTTPException, status, Depends
from typing import Annotated
import uuid
from src.config import cache
from pymongo import MongoClient

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
password_hash = PasswordHash.recommended()
DUMMY_HASH = password_hash.hash("password")
ALGORITHM = "HS256"

####################################################
# User login
####################################################
def verify_password(plain_password : str, hashed_password : str):
    """ Verifies whether two hashed passwords are the same

    Args:
        plain_password (str): password input by the user
        hashed_password (str): stored password

    Returns:
        boolean: indicates whether the passwords are the same
    """
    return password_hash.verify(plain_password, hashed_password)

def hash(password : str):
    """ Hash a password using Argon2 with default parameters

    Args:
        password (str): the password to hash

    Returns:
        str: the hashed password
    """
    return password_hash.hash(password)

async def authenticate_user(username : str, password : str, client : MongoClient):
    """ Authenticates a user given his username and password checking he exists in the system and the 
        password is correct

    Args:
        username (str): the username of the user
        password (str): the passwowrd of the user

    Returns:
        UserInDb | bool : user details found in the database or false if authentication fails
    """
    user = await find_user(username, client)
    if not user:
        verify_password(password, DUMMY_HASH)
        return False
    if not verify_password(password, user.password):
        return False
    return user

def create_access_token(data : dict, expires_delta : timedelta):
    """ Create an encoded JWT signed token along with a unique JTI for revocation

    Args:
        data (dict): the user for which to create the token
        expire_time (timedelta): time in minutes for the token expiry

    Returns:
        dict, str : dictionary with jwt, jti and expiry, and jti unique string
    """
    to_encode = data.copy()
    jti = str(uuid.uuid4())
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes = 15)

    to_encode.update({
        "exp" : expire, 
        "jti" : jti
    })
    jwt_encoded = jwt.encode(to_encode, secret_key, ALGORITHM)
    return jwt_encoded

##########################################################
# Token access
##########################################################
async def get_current_user(
        token: Annotated[str, Depends(oauth2_scheme)],
        client : Annotated[MongoClient, Depends(load_cluster)]
    ):
    """ Validates a user JWT token and JTI without checking if the user is disabled

    Args:
        token (Annotated[str, Depends): the encoded JWT token

    Raises:
        credentials_exception: Raises 401 on every validation exception

    Returns:
        User: dictionary of the current user on successful authentication
    """
    credentials_exception = HTTPException(
        status_code = status.HTTP_401_UNAUTHORIZED,
        detail = "Could not validate credentials",
        headers = {"WWW-Authenticate" : "Bearer"}
    )

    try:
        # Extract data from the JWT token
        payload = jwt.decode(token, secret_key, algorithms=[ALGORITHM])
        username = payload.get("sub")
        jti = payload.get("jti")
        token_version = payload.get("token_version")

        # Check all data is preset
        if username is None or jti is None or token_version is None:
            print(f'username or jti or token version is none')
            raise credentials_exception

        # Check if the JTI is in the redis blacklit
        if await cache.is_revoked(jti):
            print('jti issue')
            raise credentials_exception
        token_data = TokenData(username = username)
    except (InvalidTokenError, PyJWTError) as e:
        print(f'token validation : {e}')
        raise credentials_exception

    # Check if the user is in the database based on username
    user = await find_user(username = token_data.username, client = client)
    if user is None:
        print(f"user not found")
        raise credentials_exception

    # Handle password changes and compromises
    if user.token_version != token_version:
        print(f"wrong token of {user.token_version} and {token_version}")
        raise credentials_exception
    return user

##########################################################
# Log out from the application
##########################################################
async def logout_token(token : str):
    credentials_exception = HTTPException(
        status_code = status.HTTP_401_UNAUTHORIZED,
        detail = "Could not validate credentials",
        headers = {"WWW-Authenticate" : "Bearer"}
    )

    try:
        # Extract the JTI and the expiry from the token
        payload = jwt.decode(token, key = secret_key, algorithms = [ALGORITHM])
        jti = payload.get("jti")
        exp = payload.get("exp")

        if jti is None or exp is None:
            raise credentials_exception

        # Put the JTI in the blacklist if not expired
        now = datetime.now(timezone.utc).timestamp()
        ttl_seconds = max(0, now - exp)

        if(ttl_seconds > 0):
            await cache.revoke_token(jti, ttl_seconds)
    except (InvalidTokenError, PyJWTError):
        raise credentials_exception