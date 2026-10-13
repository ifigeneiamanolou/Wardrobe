# Connection pools allow multiple requests to use the same connection
# Advantages: higher throughput, reduced overhead

# Use of Redis: 
# 1) loading of items in the library and the outfit page (invalidation when a new outfit/item is added) 
# 2) loading of user profile (invalidation when the user profile details are altered)  
# 3) loading of users in the DB to add friends (invalidation after given time since a lot of 
# users may be created at once)
# 4) loading of friends (invalidation when a new friend is added) 
# 5) loading of notifications (invalidation when a new notification is received) 
# 6) loading of saved items from the feed (invalidation when a new outfit is saved or unsaved) 
# 7) Item details in an outfit for the carousel (invalidation if the creator deletes the outfit) 

# To invalidate the Redis keys, TTL is used to avoid stale data. Also, when data changes, 
# we explicitly delete the corresponding cache entries, which gives immediate consistency. In the
# future the cache entries could be updated, instead of deleted, when appropriate.

from redis.asyncio import ConnectionPool, Redis
from src.WardrobeBackend.config import conf

pool : ConnectionPool = None

async def create_pool() -> ConnectionPool:
    """ Generate a connection pool on app start up """
    global pool
    pool = ConnectionPool(
        host = conf.redis_host,
        port = conf.redis_port,
        db = conf.redis_db,
        password = conf.redis_password,
        decode_responses = True,         # Convert response from bytes to string
        socket_connect_timeout = 5,
        socket_timeout = 5,
        retry_on_timeout = True,
        max_connections = 50             # Maximum simultaneous clients
    )
    return pool

async def close_pool():
    """ Close the connection pool on app shutdown"""
    global pool
    if pool:
        await pool.aclose()

async def generate_client():
    """ Dependancy to provide a client from the pool """
    client = Redis(connection_pool = pool)
    try:
        yield client
    finally:        # Release the connection back into the pool
        await client.aclose()
