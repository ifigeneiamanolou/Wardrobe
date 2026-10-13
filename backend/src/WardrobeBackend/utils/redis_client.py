from redis.asyncio import Redis
from fastapi import HTTPException, status
from src.WardrobeBackend.models.pydantic import ItemsFromOutfit, User
from src.WardrobeBackend.models.pydantic import ItemsFromOutfit

async def revoke_token(jti : str, ttl_seconds : int, redis_client : Redis):
    """ Adds a JTI into a REDIS blacklist with the token's remaining lifetime for automatic cleanup
    when the token expires since the user is invalidated in that case by the JWT tokens

    Args:
        jti (str): the JTI to add to the blacklist
        ttl_seconds (int): the token's remaining lifetime in seconds
    """
    if not redis_client:
        raise RuntimeError("Redis is not initialized")
    try:    
        await redis_client.set(f"blacklist:{jti}", "revoked", ttl_seconds)
    except ConnectionError:
        raise HTTPException(status_code = status.HTTP_503_SERVICE_UNAVAILABLE, detail = "Unavailable")

async def is_revoked(jti : str, redis_client : Redis):
    """ Returns true if the token has been revoked using the Redis blacklist

    Args:
        jti (str): the jti of the token to check

    Returns:
        bool: indicate whether the token has been revoked
    """
    if not redis_client:   
        raise RuntimeError("Redis is not initialized")
    try:
        return await redis_client.exists(f"blacklist:{jti}") == 1
    except ConnectionError:
        raise HTTPException(status_code = status.HTTP_503_SERVICE_UNAVAILABLE, detail = "Unavailable")

async def build_key_by_user(user : User):
    return user.id 

async def build_key_by_outfit(data : ItemsFromOutfit):
    return data.outfit_id