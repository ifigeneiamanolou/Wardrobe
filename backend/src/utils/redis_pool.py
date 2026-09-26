# Connection pools allow multiple requests to use the same connection
# Advantages: higher throughput, reduced overhead
from redis.asyncio import ConnectionPool, Redis
from src.config import conf

pool : ConnectionPool = None

async def create_pool() -> ConnectionPool:
    """ Generate a connection pool on app start up """
    global pool
    pool = ConnectionPool(
        host = conf.redis_host,
        port = conf.redis_port,
        db = conf.redis_db,
        password = conf.redis_password,
        decode_responses = True,         # convert response from bytes to string
        socket_connect_timeout = 5,
        socket_timeout = 5,
        retry_on_timeout = True,
        max_connections = 50
    )
    return pool

async def close_pool():
    """ Close the connection pool on app shutdown"""
    global pool
    if pool:
        pool.aclose()

async def generate_client():
    """ Dependancy to provide a client from the pool """
    client = Redis(connection_pool = pool)
    try:
        yield client
    finally:        # Release the connection back into the pool
        await client.aclose()
