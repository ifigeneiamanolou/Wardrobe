from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from src.services.authentication import get_current_user
from src.services.database import load_outfits_items, find_all_users, find_requests, load_saved_outfits, load_items_from_outfit
from src.services.formatOutput import format_items_from_outfit, format_output_items, format_user_output, format_image, format_output_outfits, format_items_from_outfit
from src.exceptions.database import DatabaseError, DatabaseUnavailableError, NoRequestsError
from src.models.pydantic import User
from typing import Annotated
from src.routes.dependancies import MONGO_DEP
from src.utils.redis_wrapper import cache
from src.utils.redis_client import build_key

router = APIRouter()

@cache(ttl = 600, prefix = "outfits", key_builder = build_key)
@router.get("/outfits")
async def get_outfits(
    user : Annotated[User, Depends(get_current_user)],
    client : MONGO_DEP
):
    # Extract all outfits from the database for the current user
    try:
        results = await load_outfits_items(client, user.username, "Outfits")
    except DatabaseError:
        raise HTTPException(status_code = status.HTTP_501_NOT_IMPLEMENTED, detail = f"Unsuccessful loading of friends")
    except DatabaseUnavailableError:
        raise HTTPException(status_code = status.HTTP_503_SERVICE_UNAVAILABLE, detail = "Database connection error")
    results = list(results)
    if not results:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "No outfits")

    # Load the images from AWS S3 and return one by one in the frontend
    return StreamingResponse(format_output_outfits(results),  media_type="application/x-ndjson")

@cache(ttl = 600, prefix = "outfits", key_builder = build_key)
@router.get("/outfits/saved")
async def get_outfits(
    user : Annotated[User, Depends(get_current_user)],
    client : MONGO_DEP
):
    # Extract all outfits from the database for the current user
    try:
        results = await load_saved_outfits(client, user.item_ids_saved)
    except DatabaseError:
        raise HTTPException(status_code = status.HTTP_501_NOT_IMPLEMENTED, detail = f"Unsuccessful loading of friends")
    except DatabaseUnavailableError:
        raise HTTPException(status_code = status.HTTP_503_SERVICE_UNAVAILABLE, detail = "Database connection error")
    if not results:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "No saved outfits")

    # Load the images from AWS S3 and return one by one in the frontend
    return StreamingResponse(format_output_outfits(results),  media_type="application/x-ndjson")

@cache(ttl = 600, prefix = "outfits", key_builder = build_key)
@router.get("/outfits/items")
async def get_outfits(
    user : Annotated[User, Depends(get_current_user)],
    client : MONGO_DEP,
):
    # Extract all items for a given outfit
    try:
        result = await load_items_from_outfit(client, user.item_ids_saved)
    except DatabaseError:
        raise HTTPException(status_code = status.HTTP_501_NOT_IMPLEMENTED, detail = f"Unsuccessful loading of friends")
    except DatabaseUnavailableError:
        raise HTTPException(status_code = status.HTTP_503_SERVICE_UNAVAILABLE, detail = "Database connection error")

    # Load the images from AWS S3 and return them to the frontend as a list
    return await format_items_from_outfit(result)


@router.get("/outfits/friends")
async def get_outfits(
    user : Annotated[User, Depends(get_current_user)],
    client : MONGO_DEP
):
    # Extract friends of the user
    friends = await find_requests(client, user.id, True, False)
    friends = list(friends)
    if not friends:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "No friends")

    # Load the saved outfits of the above users
    # TO DO !!!!!!!!!!!!!!!!!!!!
    

@cache(ttl = 600, prefix = "items", key_builder = build_key)
@router.get("/items")
async def get_items(
    user : Annotated[User, Depends(get_current_user)],
    client : MONGO_DEP
):
    # Extract all items from the database for the current user
    try:
        results = await load_outfits_items(client, user.username)
    except DatabaseError:
        raise HTTPException(status_code = status.HTTP_501_NOT_IMPLEMENTED, detail = f"Unsuccessful loading of friends")
    except DatabaseUnavailableError:
        raise HTTPException(status_code = status.HTTP_503_SERVICE_UNAVAILABLE, detail = "Database connection error")
    results = list(results)
    if not results:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "No items")

    # Load the images from AWS S3 and return one by one in the frontend
    return StreamingResponse(format_output_items(results),  media_type="application/x-ndjson")

@cache(ttl = 600, prefix = "profiles", key_builder = build_key)
@router.get("/profile")
async def get_profile(
    user : Annotated[User, Depends(get_current_user)],
):
    formatted_image = await format_image(user.image)
    return {
       "username" : user.username,
       "email" : user.email,
       "url" : formatted_image
    }

@cache(ttl = 600, prefix = "users", key_builder = build_key)
@router.get("/users")
async def get_users(
    user : Annotated[User, Depends(get_current_user)],
    client : MONGO_DEP
):
    try:
        result = await find_all_users(client, user.username)
        formatted_result = await format_user_output(list(result))
    except DatabaseError:
        raise HTTPException(status_code = status.HTTP_501_NOT_IMPLEMENTED, detail = f"Unsuccessful loading")
    except DatabaseUnavailableError:
        raise HTTPException(status_code = status.HTTP_503_SERVICE_UNAVAILABLE, detail = "Database connection error")
    return {'users' : formatted_result}

@cache(ttl = 600, prefix = "notifications", key_builder = build_key)
@router.get("/notifications")
async def get_notifications(
    user : Annotated[User, Depends(get_current_user)],
    client : MONGO_DEP
):
    try:
        result = await find_requests(client, user.id, False)
    except NoRequestsError:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = f"No notifications")
    except DatabaseError:
        raise HTTPException(status_code = status.HTTP_501_NOT_IMPLEMENTED, detail = f"Unsuccessful loading of requests")
    except DatabaseUnavailableError:
        raise HTTPException(status_code = status.HTTP_503_SERVICE_UNAVAILABLE, detail = "Database connection error")
    return {'requests' : result}

@cache(ttl = 600, prefix = "friends", key_builder = build_key)
@router.get("/friends")
async def get_friends(
    user : Annotated[User, Depends(get_current_user)],
    client : MONGO_DEP
):
    try:
        result = await find_requests(client, user.id, True)
    except NoRequestsError:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = f"No friends")
    except DatabaseError:
        raise HTTPException(status_code = status.HTTP_501_NOT_IMPLEMENTED, detail = f"Unsuccessful loading of friends")
    except DatabaseUnavailableError:
        raise HTTPException(status_code = status.HTTP_503_SERVICE_UNAVAILABLE, detail = "Database connection error")
    return {'friends' : result}


