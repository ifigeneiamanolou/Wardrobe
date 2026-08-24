from pydantic import BaseModel

class User(BaseModel):
    username : str
    email : str | None = None
    full_name : str | None = None

class LoggedInUser(User):
    disabled : bool | None = None

class UserInDb(User):
    password : str

class Token(BaseModel):
    access_token : str
    token_type : str    # bearer

class TokenData(BaseModel):
    username : str | None = None