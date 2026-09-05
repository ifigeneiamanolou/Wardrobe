from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from src.services.authentication import get_current_user
from src.services.database import load_cluster, load_items, load_outfits
from src.services.formatOutput import format_output_items
from src.models.pydantic import User
from pymongo import MongoClient
from typing import Annotated

router = APIRouter()

@router.get("/outfits")
async def get_outfits(
    user : Annotated[User, Depends(get_current_user)],
    client : Annotated[MongoClient, Depends(load_cluster)]
):
    # Extract all outfits from the database for the current user
    results = load_outfits(client, user.username)

    if results == []:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "No outfits")

    # Load the images from AWS S3 and return one by one in the frontend
    for result in results:
        pass
    pass

@router.get("/items")
async def get_items(
    user : Annotated[User, Depends(get_current_user)],
    client : Annotated[MongoClient, Depends(load_cluster)]
):
    # Extract all items from the database for the current user
    results = load_items(client, user.username)

    if results == []:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "No items")

    # Load the images from AWS S3 and return one by one in the frontend
    return StreamingResponse(format_output_items)