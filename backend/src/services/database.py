from src.models.pydantic import ClothingItem, UserInDb, UserWithToken, NewUser
from pymongo.errors import AutoReconnect, DuplicateKeyError, OperationFailure, ConnectionFailure, ServerSelectionTimeoutError, PyMongoError
from src.exceptions.database import DatabaseUnavailableError, UserAlreadyExistsError, DatabaseError, ItemExists, PasswordIsIdentical, UserNotFound, FriendshipNotFound, NoFriendshipsError, NoRequestsError
from src.utils.db_backoff import with_retry
from src.services.formatOutput import format_image
from src.config.conf import mongodb_key
import datetime
from pymongo import MongoClient
import uuid
import time

MONGO_URI = f"mongodb+srv://ifigeneiamanolou26_db_user:{mongodb_key}@closetcluster.6sudtpr.mongodb.net/Authentication"

# Attempt connecting to the MongoDB cluster for a set number of times
def load_cluster(retries : int = 10, delay : int = 3):
    for i in range(1, retries + 1):
        client = None
        try:
            client = MongoClient(
                MONGO_URI, 
                serverSelectionTimeoutMS=60000,
                socketTimeoutMS=  45000,          
                connectTimeoutMS= 30000,
                waitQueueTimeoutMS= 20000
            )
            client.admin.command("ping")     # Ensure proper connection
            return client
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            print(f"Attempt {i}/{retries} to connect to db")
            if client:
                client.close()
            if i < retries:
                time.sleep(delay)
    raise RuntimeError("Cound not connect to mongoDB server")

# Find whether a user exists in the database based on username
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def find_user(value : str, client : MongoClient, key : str):
    try:
        users_collection = client["Authentication"]["Users"]
        document_to_find = {key : value}
        result = users_collection.find_one(document_to_find)

        if result is None:
            return None
        return UserWithToken(**result)
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except (OperationFailure) as exc:
        raise DatabaseError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

# Get an incremented counter number given its name and key
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def get_counter(client : MongoClient, name : str, key : str):
    try:
        counters_collection = client["Authentication"]["counters"]
        sequence_document = counters_collection.find_one_and_update(
            {'_id': f"{name}:{key}"},
            {'$inc' : {'sequence_number' : 1}},
            return_document = True,
            upsert = True               # Insert a document if non-existing
        )

        return sequence_document['sequence_number']
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except (OperationFailure) as exc:
        raise DatabaseError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

# Create a new user in the database
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def create_user(user : NewUser, client : MongoClient):
    payload = {
        "_id" : str(uuid.uuid4()),
        "username" : user.username,
        "name" : user.name,
        "password" : user.password,
        "email" : user.email,
        "token_version" : await get_counter(client, 'token_version', user.username),
        "push_token" : user.push_token,
        "provider_sub" : user.provider_sub       # empty string if account is created without google  
    }

    try:
        users_collection = client["Authentication"]["Users"]
        result = users_collection.insert_one(payload)
        return result.inserted_id
    except DuplicateKeyError as exc:
        raise UserAlreadyExistsError() from exc
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except PyMongoError as exc:
        raise DatabaseError() from exc

# Change the password of the given user
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def change_password(username : str, password : str, client : MongoClient):
    try:
        users_collection = client["Authentication"]["Users"]
        query_filter = {'username' : username}

        # Check if the password is the same
        result = users_collection.find_one(query_filter)

        if result["password"] == password:
            raise PasswordIsIdentical()
         
        update_operation = {
            '$set' : {'password' : password},
            '$inc' : {'token_version' : await get_counter(client, 'token_version', username)}
        }
        users_collection.update_one(query_filter, update_operation)
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except PyMongoError as exc:
        raise DatabaseError() from exc

# Save the uploaded photo of a clothing item along with metadata in the db
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def save_clothing(client : MongoClient, item : ClothingItem, color : str, 
                        category : str, username : str, url : str):
    payload = {
        "_id" : str(uuid.uuid4()),
        "name" : item.name,
        "favorite" : item.favorite,
        "shop" : item.shop,
        "price" : float(item.price),
        "size" : item.size,
        "color" : color,
        "category" : category,
        "username" : username,
        "url" : url                     # URL to the stored image in the S3 bucket
    }
    
    try:
        items_collection = client["Clothing"]["Items"]

        # Check if such an item exists
        document_to_find = {"name" : item.name}
        result = items_collection.find_one(document_to_find)
        if result is not None:
            raise ItemExists()

        # Insert the item in the database
        result = items_collection.insert_one(payload)
        return result.inserted_id
    except ItemExists:
        raise
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
            raise DatabaseError() from exc

# Find all items/outfits of a user                               
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def load_outfits_items(client : MongoClient, username : str, collection : str = "Items"):
    try:
        items_collection = client["Clothing"][collection]
        document_to_find = {'username' : username}
        results = items_collection.find(document_to_find)
        return results
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except (OperationFailure) as exc:
        raise DatabaseError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

# Update the value under the key 'favorite' in the items table for the item with the corresponding id                             
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def change_favorite(client : MongoClient, id : str, favorite : bool, collection : str = "Items"):
    try:
        items_collection = client["Clothing"][collection]
        document_to_find = {'_id' : id}
        update_operation = {
            '$set' : {'favorite' : 'yes' if favorite else 'no'}
        }
        items_collection.update_one(document_to_find, update_operation)
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

# Delete the item/outfit with the corresponding id
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def delete_item_outfit(client : MongoClient, id : str, collection : str = "Items"):
    try:
        items_collection = client["Clothing"][collection]
        document_to_find = {'_id' : id}
        items_collection.delete_one(document_to_find)
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

# Edit the value of a key of an outfit
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def edit_value(client : MongoClient, id : str, value : str, category : str, collection : str = "Items"):
    try:
        items_collection = client["Clothing"][collection]
        document_to_find = {'_id' : id}
        update_operation = {
            '$set' : {category : value}
        }
        items_collection.update_one(document_to_find, update_operation)
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

# Edit the profile picture of a user
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def edit_profile_picture(client : MongoClient, username : str, image : str):
    try:
        collection = client["Authentication"]["Users"]
        document_to_find = {'username' : username}
        update_operation = {
            '$set' : {'image' : image}
        }
        collection.update_one(document_to_find, update_operation)
    except (ConnectionFailure, ServerSelectionTimeoutError, AutoReconnect) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

# Edit the profile details of a user
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def edit_profile_details(
    client : MongoClient, 
    old_username : str,
    name : str | None = None, 
    username : str | None = None,
    email : str | None = None, 
    password : str | None = None,
    provider_sub : str | None = None
):
    try:
        collection = client["Authentication"]["Users"]
        document_to_find = {'username' : old_username}
        update_operation = {}
        if name: update_operation.update({'$set' : {'name' : name}})
        if username: update_operation.update({'$set' : {'username' : username}})
        if email: update_operation.update({'$set' : {'email' : email}})
        if password: update_operation.update({'$set' : {'password' : password}})
        if provider_sub: update_operation.update({'$set' : {'provider_sub' : provider_sub}})
        await collection.update_one(document_to_find, update_operation)
    except (ConnectionFailure, ServerSelectionTimeoutError, AutoReconnect) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

# we want to find users that ARE NOT MY FRIENDS
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def find_all_users(client : MongoClient, username : str):
    try:
        user = await find_user(username, client)
        collection = client["Authentication"]["Users"]
        result = collection.aggregate([
            {       # Match users that are not me 
                '$match' : {
                    'username' : {'$ne' : username}
                }
            },  
            {       # Look up the usernames of their friends
                '$lookup' : {
                    'from' : 'Friendships',
                    'let' : { "id_search": "$_id" },
                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$id_1", "$$id_search"] }}},
                        { "$project": {  "_id": 0, "friend_id": "$id_2"}}
                    ],
                    'as' : 'friends_1'
                }
            },
            {
                '$lookup' : {
                    'from' : 'Friendships',
                    'let' : { "id_search": "$_id" },
                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$id_2", "$$id_search"] }}},
                        { "$project": {  "_id": 0, "friend_id": "$id_1"}}
                    ],
                    'as' : 'friends_2'
                }
            },      # Add a field with the concatenated arrays
            {'$addFields' : {'friends' : {'$concatArrays' : ['$friends_1', '$friends_2']}}},
            {       # Check if they are my friend
                '$match' : {
                    'friends.friend_id' : {'$nin' : [user.id]}
                }
            },      # Select the details of the users that are not my friends
            {'$project' : {'username' : 1, 'email' : 1, 'image' : 1, 'push_token' : 1, '_id' : 0}}
        ])
        return list(result)
    except (ConnectionFailure, ServerSelectionTimeoutError, AutoReconnect) as exc:
        raise DatabaseUnavailableError(exc) from exc
    except Exception as exc:
        raise DatabaseError() from exc

# Make friendship request
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def make_friend_request(client : MongoClient, user_id : str, new_username : str):
    try:
        # Find the id of the new user
        users_collection = client["Authentication"]["Users"]
        result = users_collection.find_one({'username' : new_username})
        if result is None:
            raise UserNotFound()
        request_id = result['_id']

        # Create a new entry in the friendshipts table
        friends_collection = client['Authentication']['Friendships']
        payload = {
            "id_1" : request_id if request_id < user_id else user_id,
            "id_2" : request_id if request_id > user_id else user_id, 
            "created_at" : datetime.datetime.now(),
            "accepted" : 0,
        }
        result = friends_collection.insert_one(payload)
        return result.inserted_id
    except (ConnectionFailure, ServerSelectionTimeoutError, AutoReconnect) as exc:
        raise DatabaseUnavailableError(exc) from exc
    except Exception as exc:
        raise DatabaseError() from exc

# Accept a friendship request
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def accept_friend_request(client : MongoClient, user_id : str, new_username : str):
    try:
        # Find the id of the user from which the request came
        users_collection = client["Authentication"]["Users"]
        result = users_collection.find_one({'username' : new_username})
        if result is None:
            raise UserNotFound()
        request_id = result['_id']

        # Edit the corresponding entry in the friendships table
        friends_collection = client['Authentication']['Friendships']
        document_to_find = ({
            'id_1' : min(request_id, user_id),
            'id_2' : max(request_id, user_id)
        })
        result = friends_collection.update_one(document_to_find, {
            '$set' : {'accepted' : 1, "accepted_at" : datetime.datetime.now()}
        })

        if(result.matched_count == 0):
            raise FriendshipNotFound()
    except (ConnectionFailure, ServerSelectionTimeoutError, AutoReconnect) as exc:
        raise DatabaseUnavailableError(exc) from exc
    except Exception as exc:
        raise DatabaseError() from exc

# Load all pending requests received or all friends
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def find_requests(
    client : MongoClient, 
    user_id : str, 
    accepted : bool,
    return_image : bool = True      # By default return the image data of the user profile
):
    try:
        friends_collection = client['Authentication']['Friendships']
        result_cursor = friends_collection.aggregate([
            {'$match' : {
                'accepted' : 1 if accepted else 0,
                '$or' : [{'id_1' : user_id}, {'id_2' : user_id}]
            }},
            {'$addFields' : { 'otherUser' : { '$cond' : {
                'if' : {'$eq' : ['$id_1', user_id]},
                'then' : '$id_2',
                'else' : '$id_1'
            }}}},
            {'$lookup' : {
                'from' : 'Users',
                'localField' : 'otherUser',
                'foreignField' : '_id',
                'as' : 'friend'
            }},
            {'$unwind' : '$friend'},
            {'$unset' : 'otherUser'}
        ])
        results = list(result_cursor)
        friends = []
        if len(results) == 0:
            raise NoRequestsError()
        for result in results:
            formatted_image = ""
            data = {
                'push_token' : result['friend']['push_token'],
                'username' : result['friend']['username'],
                'email' : result['friend']['email']
            }
            if 'image' in result['friend'].keys() and return_image:
                formatted_image = await format_image(result['friend']['image'])
                data.update({'image' : formatted_image})
            friends.append(data)
        return friends
    except (ConnectionFailure, ServerSelectionTimeoutError, AutoReconnect) as exc:
        raise DatabaseUnavailableError(exc) from exc
    except Exception as exc:
        raise 

async def delete_friend(client : MongoClient, user_id : str, username : str):
    try:
        # Find the id of the user from which the request came
        users_collection = client["Authentication"]["Users"]
        result = users_collection.find_one({'username' : username})
        if result is None:
            raise UserNotFound()
        request_id = result['_id']

        # Delete the corresponding entry in the friendships table
        friends_collection = client['Authentication']['Friendships']
        result = friends_collection.delete_one({
            'id_1' : min(request_id, user_id),
            'id_2' : max(request_id, user_id)
        })

        if result.deleted_count == 0:
            raise FriendshipNotFound()
    except (ConnectionFailure, ServerSelectionTimeoutError, AutoReconnect) as exc:
        raise DatabaseUnavailableError(exc) from exc
    except Exception as exc:
        raise DatabaseError() from exc

async def save_outfit(
    items : list[str], url : str, client : MongoClient, username : str,
    name : str, favorite : str, description : str
):
    
    payload = {
        "_id" : str(uuid.uuid4()),
        "name" : name,
        "description" : description,
        "items" : items,
        "favorite" : favorite,
        "username" : username,
        "url" : url              # URL to the stored image in the S3 bucket
    }
        
    try:
        items_collection = client["Clothing"]["Outfits"]
    
        # Check if such an item exists
        document_to_find = {"name" : name}
        result = items_collection.find_one(document_to_find)
        if result is not None:
            raise ItemExists()
    
        # Insert the item in the database
        result = items_collection.insert_one(payload)
        return result.inserted_id
    except ItemExists:
        raise
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

async def add_push_notification(id : str, push_token : str, client : MongoClient):
    payload = {
        "ticket_id" : id,
        "push_token" : push_token,                         
        "created_at" : datetime.datetime.now()
    }

    try:
        items_collection = client["Notifications"]["Receipt_ids"]
        result = items_collection.insert_one(payload)
        return result.inserted_id
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

async def retrieve_push_notifications(created_at, client : MongoClient):
    document_to_find = {"created_at" : created_at}

    try:
        items_collection = client["Notifications"]["Receipt_ids"]
        results = items_collection.find(document_to_find)
        return results
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

    