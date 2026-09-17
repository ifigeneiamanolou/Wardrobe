from pydantic import BaseModel, ConfigDict, Field
from typing import Literal, Optional
from fastapi import UploadFile
from src.config.conf import NAMED_COLORS

class User(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: str = Field(alias="_id")
    username : str
    email : str
    name : str 
    image : Optional[str] = None
    push_token : str

class UserDetails(BaseModel):
    name : Optional[str] = None
    username : Optional[str] = None
    email : Optional[str] = None
    password : Optional[str] = None

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

class deleteData(BaseModel):
    id: str
    collection : Literal["Items", "Outfits"]

class editFavorite(deleteData):
    favorite : bool

class editData(deleteData):
    value : str
    category : Literal["shop", "category", "color", "price", "size", "name"]

class requestData(BaseModel):
    username : str

class Outfit(BaseModel):
    file : UploadFile
    items : list[str]
    title : str
    description : str
    favorite : str
    model_config = ConfigDict(arbitrary_types_allowed=True)


