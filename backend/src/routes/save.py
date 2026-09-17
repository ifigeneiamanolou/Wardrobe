from fastapi import APIRouter, Depends
from typing import Annotated
from pymongo import MongoClient
from src.models.pydantic import ClothingItem, User, Outfit
from src.services.authentication import get_current_user
from src.services.database import load_cluster, save_clothing, save_outfit
from src.services.predictions import predict_category, predict_color, read_image
from src.services.s3storage import upload_file_to_bucket
from src.models.parsers import load_clothing_item, load_outfit
import os
import uuid
import shutil

router = APIRouter()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMP_DIR = os.path.join(BASE_DIR, '../../data/temp')
os.makedirs(TEMP_DIR, exist_ok=True)

@router.post("/item")
async def save_item(
    item : Annotated[ClothingItem, Depends(load_clothing_item)], 
    cluster : Annotated[MongoClient, Depends(load_cluster)],
    user : Annotated[User, Depends(get_current_user)]
):
    # Save the uploaded image temporarily in local storage
    ext = item.file.filename.rsplit('.', 1)[1] or ".jpg"
    name = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(TEMP_DIR, name)
    processed_path = ""
    with open(path, "wb") as buffer:
        shutil.copyfileobj(item.file.file, buffer)

    try:
        # Process the image
        img, processed_path = await read_image(path)

        # Upload the image in an S3 bucket
        url = await upload_file_to_bucket(processed_path)

        # Predict the category of the clothing item
        category = await predict_category(img)

        # Predict the color of the item
        color = await predict_color(img)

        # Save the item in the database
        idNum = await save_clothing(cluster, item, color, category, user.username, url)
    except Exception:       # SPECIFIC HTTP EXCEPTIONS !!!!!!!!!!!!!!!!!
        raise
    finally:
        if(os.path.exists(path)):
            os.remove(path)
        if(os.path.exists(processed_path)):
            os.remove(processed_path)
    return {"message" : f"Item saved successfully with id {idNum}!"}

@router.post("/outfit")
async def save_item(
    outfit : Annotated[Outfit, Depends(load_outfit)], 
    cluster : Annotated[MongoClient, Depends(load_cluster)],
    user : Annotated[User, Depends(get_current_user)]
):
    # Save the uploaded image temporarily in local storage
    ext = outfit.file.filename.rsplit('.', 1)[1] or ".jpg"
    name = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(TEMP_DIR, name)
    with open(path, "wb") as buffer:
        shutil.copyfileobj(outfit.file.file, buffer)

    try:
        # Upload the image in an S3 bucket
        url = await upload_file_to_bucket(path)

        # Save the outfit in the database
        idNum = await save_outfit(outfit.items, url, cluster, user.username, 
                                  outfit.title, outfit.favorite, outfit.description)
    except Exception:               # SPECIFIC HTTP EXCEPTIONS !!!!!!!!!!!!!!
        raise
    finally:
        if(os.path.exists(path)):
            os.remove(path)
    return {"message" : f"Item saved successfully with id {idNum}!"}