from pymongo import MongoClient
from src.models.pydantic import ClothingItem, UserInDb, UserWithToken
import os
import uuid
import time
from pymongo.errors import DuplicateKeyError, OperationFailure, ConnectionFailure, ServerSelectionTimeoutError, PyMongoError
from src.exceptions.database import DatabaseUnavailableError, UserAlreadyExistsError, DatabaseError
from src.utils.db_backoff import with_retry
from src.config.conf import mongodb_key

MONGO_URI = f"mongodb+srv://ifigeneiamanolou26_db_user:{mongodb_key}@closetcluster.6sudtpr.mongodb.net/Authentication"

# Attempt connecting to the MongoDB cluster for a set number of times
async def load_cluster(retries : int = 10, delay : int = 3):
    for i in range(1, retries + 1):
        try:
            client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
            client.admin.command("ping")
            yield client
            return
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            print(f"Attempt {i}/{retries}")
            if i < retries:
                time.sleep(delay)
        finally:
            if client is not None:
                client.close()
    raise RuntimeError("Cound not connect to mongoDB server")

# Find whether a user exists in the database based on username
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def find_user(username : str, client : MongoClient):
    try:
        users_collection = client["Authentication"]["Users"]
        document_to_find = {"username" : username}
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
            {'_id' : name, 'key' : key},
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
async def create_user(user : UserInDb, client : MongoClient):
    payload = {
        "_id" : str(uuid.uuid4()),
        "username" : user.username,
        "name" : user.name,
        "password" : user.password,
        "email" : user.email,
        "token_version" : await get_counter(client, 'token_version', user.username),
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

# Find whether a user exists in the database by email
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def find_user_by_email(email : str, client : MongoClient):
    try:
        users_collection = client["Authentication"]["Users"]
        document_to_find = {"email" : email}
        result = users_collection.find_one(document_to_find)
        if result is None:
            return None
        return UserInDb(**result)
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except (OperationFailure) as exc:
        raise DatabaseError() from exc
    except Exception as exc:
        raise DatabaseError() from exc

# Change the password of the given user
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def change_password(username : str, password : str, client : MongoClient):
    try:
        users_collection = client["Authentication"]["Users"]
        query_filter = {'username' : username}
        update_operation = {
            '$set' : {'password' : password},
            '$inc' : {'token_version' : 1}
        }
        users_collection.update_one(query_filter, update_operation)
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        raise DatabaseUnavailableError() from exc
    except PyMongoError as exc:
        raise DatabaseError() from exc

# Save the uploaded photo of a clothing item along with metadata in the db
@with_retry(max_attempts = 5, base_delay = 0.5, backoff = 2)
async def save_clothing(client : MongoClient, item : ClothingItem, occasion : str, color : str, category : str):
    pass