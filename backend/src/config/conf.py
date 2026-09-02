import os
from dotenv import load_dotenv
load_dotenv()

# Environment variables
redis_host = os.getenv("REDIS_HOST")
redis_port = int(os.getenv("REDIS_PORT"))
redis_db = os.getenv("REDIS_DB")
redis_password = os.getenv("REDIS_PASSWORD")
secret_key = os.getenv("SECRET_KEY")
mongodb_key = os.getenv("MONGO_KEY")

# Token expiration
MINUTES_TO_EXPIRE = 15

# Bucket
bucket_name = "3770-0286-8561-bucket"