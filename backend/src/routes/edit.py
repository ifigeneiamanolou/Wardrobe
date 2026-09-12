from fastapi import APIRouter, Depends
from typing import Annotated
from src.services.authentication import get_current_user
from src.services.database import load_cluster, change_favorite, delete_item_outfit, edit_value, edit_profile_picture
from src.models.pydantic import User, editFavorite, deleteData, editData, editProfilePicture
from src.services.s3storage import upload_file_to_bucket, delete_item_from_bucket
from pymongo import MongoClient
import os
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
    data : editProfilePicture
):  
    # Save the uploaded image temporarily in local storage
    ext = data.image.filename.rsplit('.', 1)[1] or ".jpg"
    name = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(TEMP_DIR, name)
    with open(path, "wb") as buffer:
        shutil.copyfileobj(data.image.file, buffer)

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
