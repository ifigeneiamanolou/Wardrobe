import json
from functools import wraps
from src.config.cache import get_cache, set_cache
from fastapi.encoders import jsonable_encoder
from pymongo import MongoClient
from src.models.pydantic import User

def cache_response(key_func, ttl = 300):
    def decorater(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Search through cache memory
            key = key_func(*args, **kwargs)
            cached = await get_cache(key)
            if(cached):
                return json.loads(cached)

            # Set cache if not found
            result = await func(*args, *kwargs)
            encoded_result = jsonable_encoder(result)
            await set_cache(key, encoded_result, ttl)
            return result
        return wrapper
    return decorater

# Provide a key for caching through redis
def user_cache_key(current_user : User, cluster : MongoClient):
    return f"current user:{current_user.id}"
     
