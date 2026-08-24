from fastapi.security import OAuth2PasswordBearer
from src.services.database import find_user
from src.models.pydantic import User, TokenData
from pwdlib import PasswordHash
from datetime import timedelta, timezone
import datetime
import jwt
from jwt.exceptions import InvalidTokenError, PyJWTError
import os
from dotenv import load_dotenv
from fastapi import HTTPException, status, Depends
from typing import Annotated
import uuid
import redis.asyncio as redis

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
password_hash = PasswordHash.recommended()
DUMMY_HASH = password_hash.hash("password")
ALGORITHM = "HA256"
load_dotenv()
SECRET_KEY = os.environ["SECRET_KEY"]

# Redis client
client = redis.from_url(
    os.getenv("REDIS_URL", "redis://localhost:7865"),
    decode_responses = True
)

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

async def authenticate_user(username : str, password : str):
    """ Authenticates a user given his username and password checking he exists in the system and the 
        password is correct

    Args:
        username (str): the username of the user
        password (str): the passwowrd of the user

    Returns:
        UserInDb | bool : user details found in the database or false if authentication fails
    """
    user = find_user(username, password)
    if not user:
        verify_password(password, DUMMY_HASH)
        return False
    if not verify_password(password, user.password):
        return False
    return user

async def create_access_token(data : dict, expire_time : timedelta):
    """ Create an encoded JWT signed token along with a unique JTI for revocation

    Args:
        data (dict): the user for which to create the token
        expire_time (timedelta): time in minutes for the token expiry

    Returns:
        dict, str : dictionary with jwt, jti and expiry, and jti unique string
    """
    to_encode = data.copy()
    jti = str(uuid.uuid4())
    if expire_time:
        expire = datetime.now(timezone.utc) + expire_time
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes = 15)
    to_encode.update({"exp" : expire, "jti" : jti})
    jwt_encoded = jwt.encode(to_encode, SECRET_KEY, ALGORITHM)
    return jwt_encoded, jti

##########################################################
# Token access
##########################################################
async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
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
        payload = jwt.decode(token, SECRET_KEY, ALGORITHM)
        username = payload.get("sub")
        jti = payload.get("jti")
        if username is None or jti is None:
            raise credentials_exception
        if await is_revoked(jti):
            raise credentials_exception
        token_data = TokenData(username)
    except (InvalidTokenError, PyJWTError):
        raise credentials_exception

    user = find_user(username = token_data.username)
    if user is None:
        raise credentials_exception
    # CHANGE TO RETURNING THE USERNAME AND THE JTI
    return user

async def get_current_active_user(current_user: Annotated[User, Depends(get_current_user)]):
    """ Core authentication dependancy. Inject this in any route that requires a valid JWT token. 

    Args:
        current_user (Annotated[User, Depends): injected dependancy from the get_current_user function

    Raises:
        HTTPException: Exception raised when the user is inactive

    Returns:
        User: dictionary of the current user on successful authentication
    """
    if current_user.disabled:
        raise HTTPException(status_code = 400, detail = "inactive user")
    return current_user

##########################################################
# Token revocation
##########################################################

async def revoke_token(jti : str, ttl_seconds : int):
    """ Adds a JTI into a REDIS blacklist with the token's remaining lifetime for automatic cleanup
    when the token expires since the user is invalidated in that case by the JWT tokens

    Args:
        jti (str): the JTI to add to the blacklist
        ttl_seconds (int): the token's remaining lifetime in seconds
    """
    await client.setex(f"blacklist : {jti}", ttl_seconds, "revoked")

async def is_revoked(jti : str):
    """ Returns true if the token has been revoked using the Redis blacklist

    Args:
        jti (str): the jti of the token to check

    Returns:
        bool: indicate whether the token has been revoked
    """

    return await client.exists(f"blacklist : {jti}") == 1