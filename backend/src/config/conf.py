import os

redis_host = os.getenv("REDIS_HOST")
redis_port = int(os.getenv("REDIS_PORT"))
redis_db = int(os.getenv("REDIS_DB"))
redis_password = os.getenv("REDIS_PASSWORD")