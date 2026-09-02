from fastapi import APIRouter, Depends
from typing import Annotated
from pymongo import MongoClient
from src.models.pydantic import ClothingItem, User
from src.services.authentication import get_current_user
from src.services.database import load_cluster, save_clothing
from src.services.predictions import predict_category, predict_color, predict_occasion, read_image
from src.services.s3storage import upload_file_to_bucket

router = APIRouter()

@router.post("/save/item")
async def save_item(
    item : ClothingItem, 
    cluster : Annotated[MongoClient, Depends(load_cluster)],
    user : Annotated[User, Depends(get_current_user)]
):
    # Decode the image
    img, path = await read_image(item.uri)

    # Save the image in an S3 bucket
    url = await upload_file_to_bucket(path)

    # Predict the category of the clothing item
    category = await predict_category(img)

    # Predict the color of the item
    color = await predict_color(img)


    # Save the item in the database
    id = await save_clothing(cluster, item, color, category, user.username, url)
    return {"message" : f"Item saved successfully with id {id}!"}
