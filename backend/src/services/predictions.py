import cv2
from PIL import Image
import os
from rembg import remove
from src.config.conf import image_dir

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGE_DIR = os.path.join(BASE_DIR, image_dir)

# Light significantly alters the RGB value of a color, but the hue component of the HSV value is more stable
# A binary mask is generated from the image depicting whether each pixel falls within a color range
# The detected RGB primary value is converted to a named color using a csv file 
# The main color is identified using the Manhattan distance (sum of vertical and horizontal distance)
async def predict_color(img):
    return "default"

async def predict_category(img):
    return "default"

async def read_image(path : str):
    # Remove the background
    input_image = Image.open(path).convert("RGB")
    output_image = remove(input_image)

    # Save the image
    processed_path = path.rsplit(".", 1)[0] + "_processed.png"
    output_image.save(processed_path)
    img = cv2.imread(processed_path)
    return img, processed_path