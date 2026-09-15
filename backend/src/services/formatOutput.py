import base64
import json
from src.services.s3storage import load_photo

async def format_output_items(results : list):
    for result in results:
        image = await load_photo(result['url'])
        b = base64.b64encode(bytes(image))
        b64_image = b.decode('utf-8')
        data = {
            "_id" : result['_id'],
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

async def format_user_output(results : list):
    for index, result in enumerate(results):
        if 'image' not in result.keys():
            results[index] = {
                "username" : result['username'],
                "email" : result['email'],
                "image" : ""
            }
            continue
        image = await load_photo(result['image'])
        b = base64.b64encode(bytes(image))
        b64_image = b.decode('utf-8')
        data = {
            "username" : result['username'],
            "email" : result['email'],
            "image" : b64_image
        }
        results[index] = data
    return results

async def format_image(image : str):
    if image is not None:
        image = await load_photo(image)
        b = base64.b64encode(bytes(image))
        b64_image = b.decode('utf-8')
        return b64_image
    return ""

async def format_output_outfit():
    pass