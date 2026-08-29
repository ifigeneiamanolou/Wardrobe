from pydantic import BaseModel

class User(BaseModel):
    id : str
    username : str
    email : str | None = None
    full_name : str | None = None
    token_version : int = 1

class UserNewPassword(BaseModel):
    username : str
    password : str

class UserInDb(User):
    password : str

class Token(BaseModel):
    access_token : str
    token_type : str    # bearer

class TokenData(BaseModel):
    username : str | None = None