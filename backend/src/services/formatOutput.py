import base64
import json
from src.services.s3storage import load_photo

async def format_output_items(results : list):
    for result in results:
        image = await load_photo(result['url'])
        b = base64.b64encode(bytes(image))
        b64_image = b.decode('utf-8')
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