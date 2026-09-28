from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from src.models.pydantic import User
from src.routes.dependancies import MONGO_DEP
from src.services.authentication import get_current_user
router = APIRouter()

@router.get("/feed")
async def get_feed(
    user : Annotated[User, Depends(get_current_user)],
    mongo_client : MONGO_DEP
):
    # Extract the ordered outfits from the Users table
    pass

@router.post("/like")
async def change_liked(
    user : Annotated[User, Depends(get_current_user)],
    mongo_client : MONGO_DEP
):
    # Add the user to the list of users that have liked the outfit

    # Edit the "Interactions" collection
    pass

@router.post("/comment")
async def add_comment(
    user : Annotated[User, Depends(get_current_user)],
    mongo_client : MONGO_DEP
):
    # Add the comment to the "Comments" collection (username, content, date)
    pass

@router.get("/save")
async def save_outfit(
    user : Annotated[User, Depends(get_current_user)],
    mongo_client : MONGO_DEP
):
    # Add the outfit to the saved ones for the current user

    # Update the "Interactions" collection

    # Update the user profile vector using the cached outfit feature vectors
    pass