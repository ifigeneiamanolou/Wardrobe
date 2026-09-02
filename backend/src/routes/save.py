from fastapi import APIRouter, Depends
from typing import Annotated
from pymongo import MongoClient
from src.models.pydantic import ClothingItem, User
from src.services.authentication import get_current_user
from src.services.database import load_cluster, save_clothing
from src.services.predictions import predict_category, predict_color, predict_occasion

router = APIRouter()

@router.post("/save/item")
async def save_item(
    item : ClothingItem, 
    cluster : Annotated[MongoClient, Depends(load_cluster)],
    user : Annotated[User, Depends(get_current_user)]
):
    # Predict the category of the clothing item
    category = await predict_category(item.uri)

    # Predict the color of the item
    color = await predict_color(item.uri)

    # Predict the occasion for the item
    occasion = await predict_occasion(item.uri)

    # Save the item in the database
    await save_clothing(cluster, item, occasion, color, category)
    return {"message" : "Item saved successfully!"}
