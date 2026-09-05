import os
import torch
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

# Model loading
model_dir = '../../data/models/classifier.keras'
device = "cuda" if torch.cuda.is_available() else "cpu"

# Color labels for classification
NAMED_COLORS = {
    "black":       (0, 0, 0),
    "white":       (255, 255, 255),
    "red":         (255, 0, 0),
    "lime":        (0, 255, 0),
    "blue":        (0, 0, 255),
    "yellow":      (255, 255, 0),
    "cyan":        (0, 255, 255),
    "magenta":     (255, 0, 255),
    "silver":      (192, 192, 192),
    "gray":        (128, 128, 128),
    "maroon":      (128, 0, 0),
    "olive":       (128, 128, 0),
    "navy":        (0, 0, 128),
    "teal":        (0, 128, 128),
    "coral":       (255, 127, 80),
    "salmon":      (250, 128, 114),
    "tomato":      (255, 99, 71),
    "orange":      (255, 165, 0),
    "gold":        (255, 215, 0),
    "khaki":       (240, 230, 140),
    "lavender":    (230, 230, 250),
    "plum":        (221, 160, 221),
    "sienna":      (160, 82, 45),
    "slate gray":  (112, 128, 144),
    "steel blue":  (70, 130, 180),
    "forest green": (34, 139, 34),
    "dark orange":  (255, 140, 0),
    "indian red":   (205, 92, 92),
    "sky blue":     (135, 206, 235),
    "sandy brown":  (244, 164, 96),
}