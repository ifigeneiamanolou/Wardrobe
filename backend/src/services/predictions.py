import cv2
from PIL import Image
import os
from rembg import remove
from src.config.conf import image_dir, model_dir, device, NAMED_COLORS
from keras.saving import load_model
import numpy as np
from sklearn.cluster import KMeans
from scipy.spatial import KDTree

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGE_DIR = os.path.join(BASE_DIR, image_dir)
MODEL_DIR = os.path.joiN(BASE_DIR, model_dir)

CATEGORY_LABELS = [
    "T-shirt / Top",
    "Trouser",
    "Pullover",
    "Dress",
    "Coat",
    "Sandal",
    "Shirt",
    "Sneaker",
    "Bag",
    "Ankle boot"
]

async def predict_category(img):
    loaded_model = load_model(MODEL_DIR)
    loaded_model.to(device)
    img.to(device)
    preds = loaded_model(img)
    predicted = preds.argmax(dim = 1)
    return CATEGORY_LABELS[predicted]

# K-means clustering is used for detecting the dominant colors with 5 clusters
async def predict_color(img, n_colors = 5):
    # Convert to an HSV image
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # Reshape to a flat list of pixels
    pixels = img.reshape(shape = (-1, 3)).astype(np.float32)

    # Run k-means
    kmeans = KMeans(
        n_clusters = n_colors, 
        n_init = 10,                # Determines how many times the centroids are initialized
        max_iter = 300,             # Maximum number of iterations of the k-means algorithm in a run
        random_state = 42           # Used when randomly generating the centroids
    )
    kmeans.fit(pixels)

    # Sort by dominant colors and their proportions
    colors = kmeans.cluster_centers_.astype(int)
    labels, counts = np.unique(kmeans.labels_, return_counts = True)
    proportions = counts / counts.sum()

    # Extract the dominant color
    order = np.argsort(-proportions)
    primary_color = colors[order][0]

    # Map the detected color to a label using a K-dimensional tree
    label = color_to_label(primary_color)
    return label

def color_to_label(color : list):
    # Extract the labels and the values
    color_names = list(NAMED_COLORS.keys())
    color_values = np.array(list(NAMED_COLORS.values()))

    # Build the kd tree
    tree = KDTree(color_values)
    value = tree.query(tuple(color))
    index = np.where(color_values == value)[0]
    label = color_names[index]
    return label

async def read_image(path : str):
    # Remove the background
    input_image = Image.open(path).convert("RGB")
    output_image = remove(input_image)

    # Save the image
    processed_path = path.rsplit(".", 1)[0] + "_processed.png"
    output_image.save(processed_path)
    img = cv2.imread(processed_path, cv2.IMREAD_COLOR)      # No transparency
    return img, processed_path