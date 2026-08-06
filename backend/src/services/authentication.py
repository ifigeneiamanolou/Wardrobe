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

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
password_hash = PasswordHash.recommended()
DUMMY_HASH = password_hash.hash("password")
ALGORITHM = "HA256"
load_dotenv()
SECRET_KEY = os.environ["SECRET_KEY"]

####################################################
# User login
####################################################
def verify_password(plain_password : str, hashed_password : str):
    return password_hash.verify(plain_password, hashed_password)

def hash(password : str):
    return password_hash.hash(password)

async def authenticate_user(username : str, password : str):
    user = find_user(username, password)
    if not user:
        verify_password(password, DUMMY_HASH)
        return False
    if not verify_password(password, user.password):
        return False
    return user

async def create_access_token(data : dict, expire_time : timedelta):
    to_encode = data.copy()
    if expire_time:
        expire = datetime.now(timezone.utc) + expire_time
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes = 15)
    to_encode.update({"exp" : expire})
    jwt_encoded = jwt.encode(to_encode, SECRET_KEY, ALGORITHM)
    return jwt_encoded


##########################################################
# Token access
##########################################################
async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code = status.HTTP_401_UNAUTHORIZED,
        detail = "Could not validate credentials",
        headers = {"WWW-Authenticate" : "Bearer"}
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, ALGORITHM)
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username)
    except (InvalidTokenError, PyJWTError):
        raise credentials_exception

    user = find_user(username = token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(current_user: Annotated[User, Depends(get_current_user)]):
    if current_user.disabled:
        raise HTTPException(status_code = 400, detail = "inactive user")
    return current_user