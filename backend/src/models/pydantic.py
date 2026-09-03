from pydantic import BaseModel, ConfigDict
from typing import Literal, Optional
from fastapi import UploadFile

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
    file : UploadFile
    favorite : str
    shop : str
    price : str
    size : Optional[Literal["XS", "S", "M", "L", "XL"]] = None
    model_config = ConfigDict(arbitrary_types_allowed=True)