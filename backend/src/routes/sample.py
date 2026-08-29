# example of using redis for caching
from src.utils.redis_utilities import cache_response, user_cache_key
from fastapi import Depends, APIRouter
from src.models.pydantic import User
from pymongo import MongoClient
from src.services.authentication import get_current_user
from src.services.database import load_cluster

router = APIRouter()

@router.get("/videos")
@cache_response(user_cache_key)
async def get_links(
    db : MongoClient = Depends(load_cluster),
    user : User = Depends(get_current_user)
):
    return {"videos": ["video1", "video2", "video3"]}