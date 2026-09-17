from src.models.pydantic import ClothingItem, Outfit
from typing import Optional, Literal
from fastapi import Form, UploadFile, File

def load_clothing_item(
    # inform the backend to parse from multipart/form-data instead of query parameters
    name : str = Form(...),   
    shop : str = Form(...),
    price : str = Form(...),
    file : UploadFile = File(...),
    size : Optional[Literal["XS", "S", "M", "L", "XL"]] = Form(None),
    favorite : str = Form(...)
) -> ClothingItem:
    return ClothingItem(
        name = name, 
        file = file, 
        favorite = favorite, 
        shop = shop, 
        price = price, 
        size = size
    )