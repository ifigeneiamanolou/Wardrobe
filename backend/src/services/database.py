from cv2 import NORMCONV_FILTER
import numpy as np
from src.models.pydantic import ClothingItem, UserWithToken, NewUser
from pymongo.errors import AutoReconnect, DuplicateKeyError, OperationFailure, ConnectionFailure, ServerSelectionTimeoutError, PyMongoError
from src.exceptions.database import DatabaseUnavailableError, NoFriendshipsError, UserAlreadyExistsError, DatabaseError, ItemExists, PasswordIsIdentical, UserNotFound, FriendshipNotFound, NoRequestsError, ItemNotFound, NoOutfitsCreated
from src.utils.db_backoff import with_retry
from src.services.formatOutput import format_image
from src.config.conf import mongodb_key, INTERACTION_WEIGHTS
import datetime
from pymongo import AsyncMongoClient
from pymongo import UpdateOne
import uuid
import time

MONGO_URI = f"mongodb+srv://ifigeneiamanolou26_db_user:{mongodb_key}@closetcluster.6sudtpr.mongodb.net/Authentication"

# Attempt connecting to the MongoDB cluster for a set number of times
async def load_cluster(retries : int = 10, delay : int = 3):
    for i in range(1, retries + 1):
        client = None
        try:
            client = AsyncMongoClient(
                MONGO_URI, 
                serverSelectionTimeoutMS=60000,
                socketTimeoutMS=  45000,          
                connectTimeoutMS= 30000,
                waitQueueTimeoutMS= 20000
            )
            await client.admin.command("ping")     # Ensure proper connection
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
async def find_user(value : str, client : AsyncMongoClient, key : str):
    try:
        users_collection = client["Authentication"]["Users"]
        document_to_find = {key : value}
        result = await users_collection.find_one(document_to_find)

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
async def get_counter(client : AsyncMongoClient, name : str, key : str):
    try:
        counters_collection = client["Authentication"]["counters"]
        sequence_document = await counters_collection.find_one_and_update(
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
async def create_user(user : NewUser, client : AsyncMongoClient):
    user_id = str(uuid.uuid4())
    payload = {
        "_id" : user_id,
        "username" : user.username,
        "name" : user.name,
        "password" : user.password,
        "email" : user.email,
        "token_version" : await get_counter(client, 'token_version', user.username),     # Used to invalidate JTIs on corruption or change
        "push_token" : user.push_token,          # Used for expo push notifications API
        "provider_sub" : user.provider_sub,       # empty string if account is created without google
        "item_ids_saved" : []                     # saved outfits by the user
    }

    recommendations_payload = {
        "user_id" : user_id,
        "profile" : None,        # No interaction data available on sign up,
        "recommended_items" : [],
        "interaction_count" : 0,
        "comnputed_at" : None
    }

    try:
        users_collection = client["Authentication"]["Users"]
        recommendations_collection = client["Clothing"]["Recommendations"]
        result = await users_collection.insert_one(payload)
    except DuplicateKeyError as exc:
        raise UserAlreadyExistsError() from exc
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except PyMongoError as exc:
        raise DatabaseError() from exc

    try:
        recommendations_collection = client["Clothing"]["Recommendations"]
        await recommendations_collection.insert_one(recommendations_payload)
    except DuplicateKeyError as exc:
        raise UserAlreadyExistsError() from exc
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except PyMongoError as exc:
        raise DatabaseError() from exc

    return result.inserted_id

# Change the password of the given user
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def change_password(username : str, password : str, client : AsyncMongoClient):
    try:
        users_collection = client["Authentication"]["Users"]
        query_filter = {'username' : username}

        # Check if the password is the same
        result = await users_collection.find_one(query_filter)

        if result["password"] == password:
            raise PasswordIsIdentical()
         
        update_operation = {
            '$set' : {'password' : password},
            '$inc' : {'token_version' : await get_counter(client, 'token_version', username)}
        }
        await users_collection.update_one(query_filter, update_operation)
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except PyMongoError as exc:
        raise DatabaseError() from exc

# Save the uploaded photo of a clothing item along with metadata in the db
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def save_clothing(client : AsyncMongoClient, item : ClothingItem, color : str, 
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
        result = await items_collection.find_one(document_to_find)
        if result is not None:
            raise ItemExists()

        # Insert the item in the database
        result = await items_collection.insert_one(payload)
        return result.inserted_id
    except ItemExists:
        raise
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

# Find all items/outfits of a user                               
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def load_outfits_items(client : AsyncMongoClient, username : str, collection : str = "Items"):
    try:
        items_collection = client["Clothing"][collection]
        document_to_find = {'username' : username}
        results = await items_collection.find(document_to_find)
        return results
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except (OperationFailure) as exc:
        raise DatabaseError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

# Update the value under the key 'favorite' in the items table for the item with the corresponding id                             
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def change_favorite(client : AsyncMongoClient, id : str, favorite : bool, collection : str = "Items"):
    try:
        items_collection = client["Clothing"][collection]
        document_to_find = {'_id' : id}
        update_operation = {
            '$set' : {'favorite' : 'yes' if favorite else 'no'}
        }
        await items_collection.update_one(document_to_find, update_operation)
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

# Delete the item/outfit with the corresponding id
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def delete_item_outfit(client : AsyncMongoClient, id : str, collection : str = "Items"):
    items_collection = client["Clothing"][collection]
    comments_collection = client["Authentication"]["Comments"]
    comment_to_find = {"outfit_id" : id}
    document_to_find = {'_id' : id}
    try:
        # Delete the item/outfit
        await items_collection.delete_one(document_to_find)

        # If outfit, delete comments
        if collection == "Outfits":
            await comments_collection.delete_many(comment_to_find)
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

# Edit the value of a key of an outfit
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def edit_value(client : AsyncMongoClient, id : str, value : str, category : str, collection : str = "Items"):
    try:
        items_collection = client["Clothing"][collection]
        document_to_find = {'_id' : id}
        update_operation = {
            '$set' : {category : value}
        }
        await items_collection.update_one(document_to_find, update_operation)
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

# Edit the profile picture of a user
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def edit_profile_picture(client : AsyncMongoClient, username : str, image : str):
    try:
        collection = client["Authentication"]["Users"]
        document_to_find = {'username' : username}
        update_operation = {
            '$set' : {'image' : image}
        }
        await collection.update_one(document_to_find, update_operation)
    except (ConnectionFailure, ServerSelectionTimeoutError, AutoReconnect) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

# Edit the profile details of a user
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def edit_profile_details(
    client : AsyncMongoClient, 
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
async def find_all_users(client : AsyncMongoClient, username : str):
    try:
        user = await find_user(username, client)
        collection = client["Authentication"]["Users"]
        result = await collection.aggregate([
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
                        { "$project": {"_id": 0, "friend_id": "$id_2"}}
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
        return await result.to_list()
    except (ConnectionFailure, ServerSelectionTimeoutError, AutoReconnect) as exc:
        raise DatabaseUnavailableError(exc) from exc
    except Exception as exc:
        raise DatabaseError() from exc

# Make friendship request
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def make_friend_request(client : AsyncMongoClient, user_id : str, new_username : str):
    try:
        # Find the id of the new user
        users_collection = client["Authentication"]["Users"]
        result = await users_collection.find_one({'username' : new_username})
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
        result = await friends_collection.insert_one(payload)
        return result.inserted_id
    except (ConnectionFailure, ServerSelectionTimeoutError, AutoReconnect) as exc:
        raise DatabaseUnavailableError(exc) from exc
    except Exception as exc:
        raise DatabaseError() from exc

# Accept a friendship request
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def accept_friend_request(client : AsyncMongoClient, user_id : str, new_username : str):
    try:
        # Find the id of the user from which the request came
        users_collection = client["Authentication"]["Users"]
        result = await users_collection.find_one({'username' : new_username})
        if result is None:
            raise UserNotFound()
        request_id = result['_id']

        # Edit the corresponding entry in the friendships table
        friends_collection = client['Authentication']['Friendships']
        document_to_find = ({
            'id_1' : min(request_id, user_id),
            'id_2' : max(request_id, user_id)
        })
        result = await friends_collection.update_one(document_to_find, {
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
    client : AsyncMongoClient, 
    user_id : str, 
    accepted : bool,
    return_image : bool = True      # By default return the image data of the user profile
):
    try:
        friends_collection = client['Authentication']['Friendships']
        result_cursor = await friends_collection.aggregate([
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
        results = await result_cursor.to_list()
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

@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def delete_friend(client : AsyncMongoClient, user_id : str, username : str):
    try:
        # Find the id of the user from which the request came
        users_collection = client["Authentication"]["Users"]
        result = await users_collection.find_one({'username' : username})
        if result is None:
            raise UserNotFound()
        request_id = result['_id']

        # Delete the corresponding entry in the friendships table
        friends_collection = client['Authentication']['Friendships']
        result = await friends_collection.delete_one({
            'id_1' : min(request_id, user_id),
            'id_2' : max(request_id, user_id)
        })

        if result.deleted_count == 0:
            raise FriendshipNotFound()
    except (ConnectionFailure, ServerSelectionTimeoutError, AutoReconnect) as exc:
        raise DatabaseUnavailableError(exc) from exc
    except Exception as exc:
        raise DatabaseError() from exc

@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def save_outfit(
    items : list[str], url : str, client : AsyncMongoClient, user_id : str,
    name : str, favorite : str, description : str, feature_vector : np.ndarray
):
    payload = {
        "_id" : str(uuid.uuid4()),
        "name" : name,
        "description" : description,
        "items" : items,
        "favorite" : favorite,
        "user_id" : user_id,
        "number_of_likes" : 0,
        "users_ids_saved" : [],
        "created_at" : datetime.datetime.now(),
        "feature_vector" : feature_vector,
        "url" : url              # URL to the stored image in the S3 bucket
    }
        
    try:
        items_collection = client["Clothing"]["Outfits"]
    
        # Check if such an item exists
        document_to_find = {"name" : name}
        result = await items_collection.find_one(document_to_find)
        if result is not None:
            raise ItemExists()
    
        # Insert the item in the database
        result = await items_collection.insert_one(payload)
        return result.inserted_id
    except ItemExists:
        raise
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def save_delete_outfit(client : AsyncMongoClient, user_id : str, item_id : str, delete : bool = False):
    document_to_find = {"_id" : user_id}
    if delete:
        update_operation = {"$pop" : {"item_ids_saved" : item_id}}
    else:
        update_operation = {"$push" : {"item_ids_saved" : item_id}}
    outfits_collection = client["Authentication"]["Users"]
        
    try:
        await outfits_collection.update_one(document_to_find, update_operation, upsert = False)
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def increment_decrement_likes(client : AsyncMongoClient, item_id : int, increment : bool = True):
    document_to_find = {"item_id" : item_id}
    number_to_change = 1 if increment else -1
    update_operation = {'$inc' : {'number_of_likes' : number_to_change}}
    collection = client["Clothing"]["Outfits"]

    try:
        await collection.update_one(document_to_find, update_operation, upsert = False)
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def add_push_notification(id : str, push_token : str, client : AsyncMongoClient):
    payload = {
        "ticket_id" : id,
        "push_token" : push_token,                         
        "created_at" : datetime.datetime.now()
    }

    try:
        items_collection = client["Notifications"]["Receipt_ids"]
        result = await items_collection.insert_one(payload)
        return result.inserted_id
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def retrieve_push_notifications(created_at, client :AsyncMongoClient):
    document_to_find = {"created_at" : created_at}

    try:
        items_collection = client["Notifications"]["Receipt_ids"]
        results = await items_collection.find(document_to_find)
        return results
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def save_interaction(
    user_id : str, 
    item_id : int, 
    interaction_type : str, 
    client : AsyncMongoClient
):
    # Raise a value error if needed
    if interaction_type not in INTERACTION_WEIGHTS.keys():
        raise ValueError("Interaction type is invalid!")
    
    payload = {
        "user_id" : user_id,
        "item_id" : item_id,
        "interaction_type" : interaction_type,
        "weight" : INTERACTION_WEIGHTS[interaction_type]
    }

    try:
        interactions_collection = client["Feed"]["Interactions"]
        result = await interactions_collection.insert_one(payload)
        return result.inserted_id
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def delete_interaction(
    user_id : str, 
    item_id : int, 
    interaction_type : str, 
    client : AsyncMongoClient,
):
    # Raise a value error if needed
    if interaction_type not in INTERACTION_WEIGHTS.keys():
        raise ValueError("Interaction type is invalid!")

    query_filter = {"user_id" : user_id, "item_id" : item_id, "interaction_type" : interaction_type}
    interactions_collection = client["Feed"]["Interactions"]
    try:
        result = await interactions_collection.delete_one(query_filter)
        return result.inserted_id
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def fetch_user_profile_vector(client : AsyncMongoClient, user_id : str):
    document_to_find = {"user_id" : user_id}
    
    try:
        items_collection = client["Clothing"]["Recommendations"]
        result = await items_collection.find_one(document_to_find)

        if result and result.get("profile"):
            return result.get("profile")
        else:
            return None
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def fetch_user_recommendations(client : AsyncMongoClient, user_id : str):
    document_to_find = {"user_id" : user_id}
    try:
        items_collection = client["Clothing"]["Recommendations"]
        result = await items_collection.find_one(document_to_find)

        if result and len(result.get("recommended_items")) != 0:
            return result.get("recommended_items")
        else:
            return await load_favorite_items(client, user_id)
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def fetch_item_feature_vector(client : AsyncMongoClient, item_id : str):
    document_to_find = {"_id" : item_id}

    try:
        items_collection = client["Clothing"]["Items"]
        result = await items_collection.find_one(document_to_find)
    
        if result and result.get("feature_vector") and result.get("created_at"):
            return list(result.get("feature_vector")), result.get("created_at")
        else:
            raise ItemNotFound
    except ItemNotFound:
        raise
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def update_recommendations(
    client : AsyncMongoClient, 
    user_id : str, 
    recommended_items : list[dict],
    profile : list[int] | None = None
):
    collection = client["Clothing"]["Recommendations"]
    document_to_find = {"user_id" : user_id}
    payload = {
        "profile" : profile,
        "recommended_items" : recommended_items,
    }

    if profile is not None:         # Daily full update
        payload.update({
            "profile" : profile,
            "computed_at" : datetime.datetime.now()
        })
    else:               # Triggered on user interaction
        payload.update({
            "last_incremental_update" : datetime.datetime.now()
        })

    try:
        await collection.update_one(document_to_find, {"$set" : payload})
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

# Bulk update operation for the recommendations to remove number of calls
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def update_recommendations_batch(
    client : AsyncMongoClient, 
    user_ids : list[str], 
    scores : list[float],
    item_id : str
):
    collection = client["Clothing"]["Recommendations"]
    operation = [UpdateOne(
        filter = {"user_id" : user_id},
        update = {
            '$push' : {"recommended_items" : {
                '$each' : [{"item_id" : item_id, "score" : float(score)}],
                '$sort' : {'score' : -1},
                '$slice' : 100      # Maximum number of recommended items
            }}, 
            '$set' : {"last_incremental_update" : datetime.datetime.now()}
        }
    ) for user_id, score in zip(user_ids, scores)]

    try:
        await collection.bulk_write(operation, ordered = False)
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def load_favorite_items(client : AsyncMongoClient, user_id : str):
    collection = client["Clothing"]["Outfits"]
    friends_collection = client["Authentication"]["Friendships"]

    try:
        # Fetch a list the ids of all friends of the current user
        result_cursor = await friends_collection.aggregate([
            {'$match' : {
                'accepted' : 1,
                '$or' : [{'id_1' : user_id}, {'id_2' : user_id}]
            }},
            {'$addFields' : { 'otherUser' : { '$cond' : {
                'if' : {'$eq' : ['$id_1', user_id]},
                'then' : '$id_2',
                'else' : '$id_1'
            }}}},
            {'$project' : {'otherUser' : 1}}        # Only return the ids of the friends
        ])
        friends = await result_cursor.to_list()

        # Handle the case no friends are found
        if len(friends) == 0:
            raise NoFriendshipsError

        # Find all outfits created by them in the db (max 1000)
        outfits_cursor = await collection.aggregate([
            {'$match' : {'user_id' : {'$in' : friends}}},
            {'$sort' : {'number_of_likes' : -1}},            # descending order
            {'$limit' : 100}
        ])
        outfits = await outfits_cursor.to_list()
        
        # Handle the case no outfits have been created
        if len(outfits) == 0:
            raise NoOutfitsCreated
        return outfits
    except (NoFriendshipsError, ItemNotFound):
        raise
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def fetch_friend_profiles(client : AsyncMongoClient, user_id : str):
    collection = client["Clothing"]["Recommendations"]
    friends_collection = client["Authentication"]["Friendships"]
    try:
        result_cursor = await friends_collection.aggregate([
            {'$match' : {
                'accepted' : 1,
                '$or' : [{'id_1' : user_id}, {'id_2' : user_id}]
            }},
            {'$addFields' : { 'otherUser' : { '$cond' : {
                'if' : {'$eq' : ['$id_1', user_id]},
                'then' : '$id_2',
                'else' : '$id_1'
            }}}},
            {'$project' : {'otherUser' : 1}}        # Only return the ids of the friends
        ])

        friends = await result_cursor.to_list()
        
        # Handle the case no friends are found
        if len(friends) == 0:
            raise NoFriendshipsError

        # Find the profiles of the above users
        recommendation_cursor = await collection.aggregate([
            {'$match' : {'user_id' : {'$in' : [f["otherUser"] for f in friends]}}},
            {'$project' : {'_id' : 0, 'user_id' : 1, 'profile' : 1, 'recommended_items' : 1}}
        ])
        result = await recommendation_cursor.to_list()
        return result
    except NoFriendshipsError:
        raise NoOutfitsCreated
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def create_comment(client : AsyncMongoClient, comment : str, outfit_id : str, user_id : str):
    payload = {
        "outfit_id" : outfit_id,
        "user_id" : user_id,
        "created_at" : datetime.datetime.now(),
        "comment" : comment
    }
    collection = client["Authentication"]["Comments"]

    try:
        await collection.insert_one(payload)
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def load_saved_outfits(client : AsyncMongoClient, item_ids : list[str]):
    collection = client["Clothing"]["Outfits"]

    # Raise an exception if the user hasn't saved any outfits
    if len(item_ids) == 0:
        raise NoOutfitsCreated

    try:
        result_cursor = await collection.aggregate(
            {'$match' : {'_id' : {'$in' : item_ids}}}
        )
        result = await result_cursor.to_list()
        return result
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
       raise DatabaseError() from exc


@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def load_items_from_outfit(client : AsyncMongoClient, item_ids : list[str]):
    collection = client["Clothing"]["Items"]
    image_urls = []
    try:
        for item_id in item_ids:
            document_to_find = {'_id' : item_id}
            result = await collection.find_one(document_to_find)
            image_urls.append(result['url'])
        return image_urls
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except Exception as exc:
       raise DatabaseError() from exc
    
# function to load comments for a given outfit  !!!!!!!!!!!!!