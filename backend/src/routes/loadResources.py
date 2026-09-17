from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from src.services.authentication import get_current_user
from src.services.database import load_cluster, load_outfits_items, find_all_users, find_requests
from src.services.formatOutput import format_output_items, format_user_output, format_image, format_output_outfits
from src.exceptions.database import DatabaseError, DatabaseUnavailableError, NoRequestsError
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
    results = await load_outfits_items(client, user.username, "Outfits")
    results = list(results)

    if not results:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "No outfits")

    # Load the images from AWS S3 and return one by one in the frontend
    return StreamingResponse(format_output_outfits(results),  media_type="application/x-ndjson")

@router.get("/items")
async def get_items(
    user : Annotated[User, Depends(get_current_user)],
    client : Annotated[MongoClient, Depends(load_cluster)]
):
    # Extract all items from the database for the current user
    results = await load_outfits_items(client, user.username)
    results = list(results)

    if not results:
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = "No items")

    # Load the images from AWS S3 and return one by one in the frontend
    return StreamingResponse(format_output_items(results),  media_type="application/x-ndjson")

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

@router.get("/users")
async def get_users(
    user : Annotated[User, Depends(get_current_user)],
    client : Annotated[MongoClient, Depends(load_cluster)]
):
    try:
        result = await find_all_users(client, user.username)
        formatted_result = await format_user_output(list(result))
    except DatabaseError:
        raise HTTPException(status_code = status.HTTP_501_NOT_IMPLEMENTED, detail = f"Unsuccessful loading")
    except DatabaseUnavailableError:
        raise HTTPException(status_code = status.HTTP_503_SERVICE_UNAVAILABLE, detail = "Database connection error")
    return {'users' : formatted_result}

@router.get("/notifications")
async def get_notifications(
    user : Annotated[User, Depends(get_current_user)],
    client : Annotated[MongoClient, Depends(load_cluster)]
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

@router.get("/friends")
async def get_friends(
    user : Annotated[User, Depends(get_current_user)],
    client : Annotated[MongoClient, Depends(load_cluster)]
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


