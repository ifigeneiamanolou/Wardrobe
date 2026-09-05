import base64
import json
from src.services.s3storage import load_photo
async def format_output_items(results : dict):
    for result in results:
        image = load_photo(result['url'])
        b64_image = base64.encode(image)
        data = {
            "image" : b64_image,
            "name" : result['name'],
            "favorite" : result['favorite'],
            "shop" : result['shop'],
            "price" : result['price'],
            "size" : result['size'],
            "color" : result['color'],
            "category" : result['category']
        }
        yield json.dumps(data) + '\n'   # Use a line separator to denote the end of an image stream