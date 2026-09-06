from fastapi import APIRouter, Depends
from typing import Annotated
from src.services.authentication import get_current_user
from src.services.database import load_cluster, change_favorite, delete_item_outfit
from pymongo import MongoClient
from src.models.pydantic import User, editFavorite, deleteData

router = APIRouter()
@router.post("/favorite")
async def toggle_favorite(
    _ : Annotated[User, Depends(get_current_user)],
    client : Annotated[MongoClient, Depends(load_cluster)],
    data : editFavorite
):
    await change_favorite(client, data._id, data.favorite, data.collection)

@router.post("/delete")
async def delete_item(
    _ : Annotated[User, Depends(get_current_user)],
    client : Annotated[MongoClient, Depends(load_cluster)],
    data : deleteData
):
    await delete_item_outfit(client, data._id, data.collection)
    