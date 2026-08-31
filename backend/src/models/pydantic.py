from pydantic import BaseModel

class User(BaseModel):
    username : str
    email : str
    name : str 
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