from fastapi import APIRouter
from typing import Annotated
from fastapi import HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from src.models.pydantic import User, UserInDb
from datetime import timedelta
from src.services.authentication import authenticate_user, create_access_token, hash, get_current_user
from src.services.database import find_user, find_user_by_email, create_user
router = APIRouter()

MINUTES_TO_EXPIRE = 15

@router.post("/token")
async def login(form_data : Annotated[OAuth2PasswordRequestForm, Depends()]):
    # Find a user in the database
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail = "incorrect username or password",
            headers = {"WWW-Authenticate" : "Bearer"}
        )

    # Generate an access token
    access_token_expires = timedelta(minutes = MINUTES_TO_EXPIRE)
    token = create_access_token(
        data = {"sub" : user.username},
        expires_delta = access_token_expires
    )
    return {"access_token" : token, "token_type" : "bearer"}

@router.post("/users/me")
# Sample endpoint with dependancy injection to validate the user with the JWT token provided
# If the token is expired, tampered, missing, or lacking the sub entry yields the same error
# avoiding leaking of information about the validation system to attackers
async def read_users_me(current_user : Annotated[User, Depends(get_current_user)]):
    return current_user

@router.post("/signup")
async def create_user(user : UserInDb):
    # Verify that there is no such user in the system otherwise raise an exception
    if find_user(user.username) is not None:
        raise HTTPException(status_code = 400, detail = "Another user with the same username in the system")

    # Verify that there is no such email in the system otherwise raise an exception
    if find_user_by_email(user.email) is not None:
        raise HTTPException(status_code = 400, detail = "Another user with the same username in the system")

    # Hash the password
    password_hash = hash(user.password)
    user.password = password_hash

    # Enter the user in the database
    try:
        create_user(user = user)
    except Exception as e:
        raise HTTPException(status_code = status.HTTP_501_NOT_IMPLEMENTED, detail = "Unsuccessful account creation")


# In production three scenarios demand server-side revocatin with JWT tokens:
# 1) The users logs out: the token needs to be invalidated
# 2) The user changes the password : all issued tokens need to be invalidated
# 3) The credentials are compromised 

# The mechanism used is JTI (JWT ID) claim; a unique id generated for each token
# This is stored in a Redis SET (unordered collection of unique strings) with a TTL
# The token is invalidated against a blacklist (a list of tokens that are invalidated)
# When a user logs out their token is effectively added to that blacklist

# Why redis :
# It is a high-performance in memory key-value database providing
# 1) Speed
# 2) Distributed use : multiple servers can use one redis instance
# 3) TTL : Redis automatically removes entries after a given time period (this needs to be set
#    to the expiry time of the JWT token to eliminate the need for cleanup and keep Redis memory
#    footprint bounded)

# Instead of having to blacklist every single JTI when the password changes or is compromised (in case
# the user has logged in with multiple devices), use a token version key along with the token. On each 
# validation we compare the version stored in the database against the token version claim. To revoke 
# all tokens increment the counter; now every token issued before fails validation. Both blacklisting
# and token versions are used to simulate a real production environment.

