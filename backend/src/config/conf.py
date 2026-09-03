import os
from dotenv import load_dotenv
load_dotenv()

# Environment variables
redis_host = os.getenv("REDIS_HOST")
redis_port = int(os.getenv("REDIS_PORT"))
redis_db = int(os.getenv("REDIS_DB"))
redis_password = os.getenv("REDIS_PASSWORD")
secret_key = os.getenv("SECRET_KEY")
mongodb_key = os.getenv("MONGO_KEY")
aws_key = os.getenv("AWS_ACCESS_KEY")
aws_secret_key = os.getenv("AWS_SECRET_KEY")
aws_region = 'us-east-1'

# Token expiration
MINUTES_TO_EXPIRE = 15

# Bucket
bucket_name = "3770-0286-8561-bucket"

# Local caching
image_dir = '../../data/image.jpg'