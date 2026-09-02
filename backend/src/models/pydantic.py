from pydantic import BaseModel, Field

class User(BaseModel):
    username : str
    email : str
    name : str 

class UserNewPassword(BaseModel):
    username : str
    password : str

class UserInDb(User):
    password : str

class UserWithToken(UserInDb):
    token_version : int = 1

class Token(BaseModel):
    access_token : str
    token_type : str    # bearer

class TokenData(BaseModel):
    username : str | None = None

class ClothingItem(BaseModel):
    name : str
    uri : str
    favorite : bool
    shop : str
    price : float
    size : str = Field(["XS", "S", "M", "L", "XL"])