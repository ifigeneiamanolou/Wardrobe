# Used to handle all Redis operations in the application (initialize, close, set, get, delete)

from src.config import conf
from redis.asyncio import Redis
from fastapi import HTTPException, status

async def init_redis():
    # Initialize a redis connection on application startup
    global redis        # Global declaration allows us to use this variable outside of this function
    redis = Redis(
        host = conf.redis_host,
        port = conf.redis_port,
        db = conf.redis_db,
        password = conf.redis_password
    )

async def close():
    # Close the connection on app shutdown
    global redis
    if redis:
        await redis.close()

async def get_cache(key : str):
    if not redis:
        raise RuntimeError("Redis is not initialized")
    try:
        return await redis.get(key)
    except ConnectionError:
        raise HTTPException(status_code = status.HTTP_503_SERVICE_UNAVAILABLE, detail = "Unavailable")

async def set_cache(key : str, value : str, ttl : int = 300):
    if not redis:
        raise RuntimeError("Redis is not initialized")
    try:
        await redis.set(key, value, ttl)
    except ConnectionError:
        raise HTTPException(status_code = status.HTTP_503_SERVICE_UNAVAILABLE, detail = "Unavailable")
    

async def delete_cache(key : str):
    if not redis:
        raise RuntimeError("Redis is not initialized")
    try:
        await redis.delete(key)
    except ConnectionError:
        raise HTTPException(status_code = status.HTTP_503_SERVICE_UNAVAILABLE, detail = "Unavailable")
    

async def revoke_token(jti : str, ttl_seconds : int):
    """ Adds a JTI into a REDIS blacklist with the token's remaining lifetime for automatic cleanup
    when the token expires since the user is invalidated in that case by the JWT tokens

    Args:
        jti (str): the JTI to add to the blacklist
        ttl_seconds (int): the token's remaining lifetime in seconds
    """
    if not redis:
        raise RuntimeError("Redis is not initialized")
    try:    
        await redis.set(f"blacklist:{jti}", "revoked", ttl_seconds)
    except ConnectionError:
        raise HTTPException(status_code = status.HTTP_503_SERVICE_UNAVAILABLE, detail = "Unavailable")


async def is_revoked(jti : str):
    """ Returns true if the token has been revoked using the Redis blacklist

    Args:
        jti (str): the jti of the token to check

    Returns:
        bool: indicate whether the token has been revoked
    """
    if not redis:   
        raise RuntimeError("Redis is not initialized")
    try:
        return await redis.exists(f"blacklist:{jti}") == 1
    except ConnectionError:
        raise HTTPException(status_code = status.HTTP_503_SERVICE_UNAVAILABLE, detail = "Unavailable")
    