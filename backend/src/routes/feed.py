from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from src.models.pydantic import User, ChangeFeed, CommentData
from src.exceptions.database import DatabaseError, DatabaseUnavailableError, NoOutfitsCreated, NoFriendshipsError, ItemNotFound
from src.routes.dependancies import MONGO_DEP
from src.services.database import fetch_user_recommendations, increment_decrement_likes, save_delete_outfit, create_comment
from src.services.authentication import get_current_user
from src.services.feed import update_interaction
router = APIRouter()

async def safe_update_interaction(*args):
    try:
        await update_interaction(*args)
    except (NoFriendshipsError, NoOutfitsCreated):
        pass  # nothing to rescore, not an error
    except ItemNotFound:
        print("Item has been deleted!")
    except Exception:
        print("Profile update failed!")

@router.get("/feed")
async def get_feed(
    user : Annotated[User, Depends(get_current_user)],
    mongo_client : MONGO_DEP
):
    try:
        recommendations = await fetch_user_recommendations(mongo_client, user.id)
    except (DatabaseError, DatabaseUnavailableError):
        raise HTTPException(status_code = status.HTTP_501_NOT_IMPLEMENTED, detail = f"Unsuccessful loading of requests")

    if len(recommendations) == 0:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "No recommended outfits found")

    return {"recommended_items" : recommendations}

@router.post("/like")
async def change_liked(
    user : Annotated[User, Depends(get_current_user)],
    client : MONGO_DEP,
    data : ChangeFeed,
    background_tasks: BackgroundTasks
):
    try:
        # Add the outfit to the saved ones for the current user
        await increment_decrement_likes(client, data.item_id, not data.delete)
    except (DatabaseError, DatabaseUnavailableError):
        raise HTTPException(status_code = status.HTTP_501_NOT_IMPLEMENTED, detail = f"Unsuccessful loading of requests")
    
    background_tasks.add_task(safe_update_interaction, user.id, data.item_id, "like", client, data.delete)
    return {"status" : "ok"}
   
@router.post("/comment")
async def add_comment(
    user : Annotated[User, Depends(get_current_user)],
    mongo_client : MONGO_DEP,
    data : CommentData
):
    try:
        # Add the comment to the "Comments" collection
        await create_comment(mongo_client, data.comment, data.outfit_id, data.user_id)
    except (DatabaseError, DatabaseUnavailableError):
        raise HTTPException(status_code = status.HTTP_501_NOT_IMPLEMENTED, detail = f"Unsuccessful loading of requests")

@router.get("/save")
async def save_outfit(
    user : Annotated[User, Depends(get_current_user)],
    mongo_client : MONGO_DEP,
    data : ChangeFeed,
    background_tasks: BackgroundTasks
):
    try:
        # Add the outfit to the saved ones for the current user
        await save_delete_outfit(mongo_client, user.id, data.item_id, data.delete)
    except (DatabaseError, DatabaseUnavailableError):
        raise HTTPException(status_code = status.HTTP_501_NOT_IMPLEMENTED, detail = f"Unsuccessful loading of requests")

    background_tasks.add_task(safe_update_interaction, user.id, data.item_id, "save", mongo_client, data.delete)
    return {"status" : "ok"}

