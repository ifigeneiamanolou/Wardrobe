import redis.asyncio as redis
import json
import hashlib
from functools import wraps
from typing import Callable, Optional, Any
from src.utils.redis_client import get_cache, set_cache

redis_client: redis.Redis = None

def cache(ttl : int = 300, prefix : str = "cache", key_builder : Optional[Callable] = None):
    """ Decorator to cache the result of the function or retrieve it

    Args:
        ttl (int, optional): Time until cached data is invalidated. Defaults to 300.
        prefix (str, optional): Fixed label for the cache key. Defaults to "cache".
        key_builder (Optional[Callable], optional): Custom function to generate the 
        cache key. Defaults to None.
    """
    def decorator(func : Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Build the cache key
            cache_parts = [prefix, func.__name__]
            if key_builder:
                custom_key = key_builder(*args, **kwargs)
                cache_parts.append(custom_key)
            else:
                for arg in args:
                    cache_parts.append(str(arg))

                for k, v in sorted(kwargs.items()):
                    cache_parts.append(f"{k}={v}")
            cache_key = ":".join(cache_parts)

            # Try to get the result from cache
            try:
                result = await get_cache(cache_key, redis_client)
                if result:
                    return json.loads(result)
            except (redis.ConnectionError, json.JSONDecodeError):
                pass

            # Call the actual function
            result = func(*args, **kwargs)

            # Cache the result
            try:
                await set_cache(redis_client, cache_key, result, ttl = ttl)
            except redis.ConnectionError:
                pass
            return result
        return wrapper
    return decorator
    



