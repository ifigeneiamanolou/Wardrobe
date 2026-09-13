from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from typing import Annotated
from src.services.authentication import get_current_user, hash
from src.services.database import (load_cluster, change_favorite, delete_item_outfit, edit_value, 
                                   edit_profile_picture, edit_profile_details, find_user, 
                                   find_user_by_email, make_friend_request, accept_friend_request,
                                   delete_friend)
from src.models.pydantic import User, editFavorite, deleteData, editData, UserDetails, requestData
from src.services.s3storage import upload_file_to_bucket, delete_item_from_bucket
from pymongo import MongoClient
import os
from src.exceptions.database import DatabaseUnavailableError, DatabaseError, UserNotFound, FriendshipNotFound
import uuid
import shutil

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMP_DIR = os.path.join(BASE_DIR, '../../data/temp')
os.makedirs(TEMP_DIR, exist_ok=True)

router = APIRouter()
@router.post("/favorite")
async def toggle_favorite(
    _ : Annotated[User, Depends(get_current_user)],
    client : Annotated[MongoClient, Depends(load_cluster)],
    data : editFavorite
):
    try:
        await change_favorite(client, data.id, data.favorite, data.collection)
    except Exception:
        raise

@router.post("/delete")
async def delete_item(
    _ : Annotated[User, Depends(get_current_user)],
    client : Annotated[MongoClient, Depends(load_cluster)],
    data : deleteData
):
    try:
        await delete_item_outfit(client, data.id, data.collection)
    except Exception:
        raise

@router.post("/value")
async def edit_item_value(
    _ : Annotated[User, Depends(get_current_user)],
    client : Annotated[MongoClient, Depends(load_cluster)],
    data : editData
):
    try:
        await edit_value(client, data.id, data.value, data.category, data.collection)
    except Exception:
        raise

@router.post("/profile/picture")
async def toggle_favorite(
    user : Annotated[User, Depends(get_current_user)],
    client : Annotated[MongoClient, Depends(load_cluster)],
    data : UploadFile = File(...)
):  
    # Save the uploaded image temporarily in local storage
    ext = data.filename.rsplit('.', 1)[1] or ".jpg"
    name = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(TEMP_DIR, name)
    with open(path, "wb") as buffer:
        shutil.copyfileobj(data.file, buffer)

    url = None
    try:
        # Upload the image in an S3 bucket
        url = await upload_file_to_bucket(path)

        # Save the image in the database
        await edit_profile_picture(client, user.username, url)
    except Exception:
        # Delete the image from the bucket if db upload failed
        if url:
            try:
                await delete_item_from_bucket(url)
            except Exception as e:
                print(f"Failed to roll back S3 object {url}: {e}")
        raise
    finally:
        if(os.path.exists(path)):
            os.remove(path)

    return {"message" : f"Profile picture saved successfully!"}

@router.post("/profile/details")
async def toggle_favorite(
    user : Annotated[User, Depends(get_current_user)],
    client : Annotated[MongoClient, Depends(load_cluster)],
    data : UserDetails
):  
    try:
        existing_user = await find_user(user.username, client)
    except DatabaseError:
        raise HTTPException(status_code = status.HTTP_501_NOT_IMPLEMENTED, detail = "Unsuccessful user search")
    except DatabaseUnavailableError:
        raise HTTPException(status_code = status.HTTP_503_SERVICE_UNAVAILABLE, detail = "Database connection error")
    if existing_user is not None:
        raise HTTPException(status_code = status.HTTP_409_CONFLICT, detail = "Another user with the same username")

    try:
        existing_user_email = await find_user_by_email(user.email, client)
    except DatabaseError:
        raise HTTPException(status_code = status.HTTP_501_NOT_IMPLEMENTED, detail = "Unsuccessful user search by email")
    except DatabaseUnavailableError:
        raise HTTPException(status_code = status.HTTP_503_SERVICE_UNAVAILABLE, detail = "Database connection error")
    if existing_user_email is not None:
        raise HTTPException(status_code = status.HTTP_409_CONFLICT, detail = "Another user with the same email")

    # Hash the password
    if(data.password):
        data.password = hash(data.password)

    try:
        await edit_profile_details(
            client, 
            user.username, 
            data.name, 
            data.username, 
            data.email, 
            data.password
        )
    except DatabaseError:
        raise HTTPException(status_code = status.HTTP_501_NOT_IMPLEMENTED, detail = "Unsuccessful user search by email")
    except DatabaseUnavailableError:
        raise HTTPException(status_code = status.HTTP_503_SERVICE_UNAVAILABLE, detail = "Database connection error")

@router.post("/friend/request")
async def get_friends(
    user : Annotated[User, Depends(get_current_user)],
    client : Annotated[MongoClient, Depends(load_cluster)],
    data : requestData
):
    try:
        await make_friend_request(client, user.id, data.username)
    except DatabaseError:
        raise HTTPException(status_code = status.HTTP_501_NOT_IMPLEMENTED, detail = f"Unsuccessful request")
    except DatabaseUnavailableError:
        raise HTTPException(status_code = status.HTTP_503_SERVICE_UNAVAILABLE, detail = "Database connection error")
    except UserNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = f"User with username {data.username} does not exist")
    return {'message' : 'Successful request'}

@router.post("/friend/delete")
async def get_friends(
    user : Annotated[User, Depends(get_current_user)],
    client : Annotated[MongoClient, Depends(load_cluster)],
    data : requestData
):
    try:
        await delete_friend(client, user.id, data.username)
    except DatabaseError:
        raise HTTPException(status_code = status.HTTP_501_NOT_IMPLEMENTED, detail = f"Unsuccessful deletion")
    except DatabaseUnavailableError:
        raise HTTPException(status_code = status.HTTP_503_SERVICE_UNAVAILABLE, detail = "Database connection error")
    except (UserNotFound, FriendshipNotFound):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = f"User with username {data.username} or friendship does not exist")
    return {'message' : 'Successful deletion'}

@router.post("/accept/request")
async def get_friends(
    user : Annotated[User, Depends(get_current_user)],
    client : Annotated[MongoClient, Depends(load_cluster)],
    data : requestData
):
    try:
        await accept_friend_request(client, user.id, data.username)
    except DatabaseError:
        raise HTTPException(status_code = status.HTTP_501_NOT_IMPLEMENTED, detail = f"Unsuccessful request")
    except DatabaseUnavailableError:
        raise HTTPException(status_code = status.HTTP_503_SERVICE_UNAVAILABLE, detail = "Database connection error")
    except UserNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = f"User with username {data.username} does not exist")
    except FriendshipNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail = "Friendship request not found")
    return {'message' : 'Successful update'}
