import numpy as np
import urllib.request
import cv2
import pandas as pd
from rembg import remove
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGE_DIR = os.path.join(BASE_DIR, '../../data/image.jpg')

# Light significantly alters the RGB value of a color, but the hue component of the HSV value is more stable
# A binary mask is generated from the image depicting whether each pixel falls within a color range
# The detected RGB primary value is converted to a named color using a csv file 
# The main color is identified using the Manhattan distance (sum of vertical and horizontal distance)
async def predict_color(img):
    hsv_image = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    return "default"

async def predict_category(img):
    return "default"

async def read_image(uri : str, path : str = IMAGE_DIR):
    # Read the contents of the URL
    url_response = urllib.request.urlopen(uri)

    # Convert into a numpy array removing the background
    arr = np.array(bytearray(url_response.read()), dtype = np.int8)
    output = remove(arr)
    output.save(path)

    # Decode the image
    img = cv2.imdecode(output, cv2.IMREAD_COLOR)
    return img, path