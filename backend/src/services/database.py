from pymongo import MongoClient
from fastapi import Depends
from typing import Annotated
from src.models.pydantic import UserInDb
from dotenv import load_dotenv
import os

load_dotenv()
MONGO_KEY = os.getenv("MONGO_KEY")

MONGO_URI = f"mongodb+srv://ifigeneiamanolou26_db_user:{MONGO_KEY}@closetcluster.6sudtpr.mongodb.net/?appName=ClosetCluster"

def load_cluster():
    client = MongoClient(MONGO_URI)
    try:
        yield client
    finally:
        client.close()

async def find_user(username : str, client : Annotated[MongoClient, Depends(load_cluster)]):
    db = client["Authentication"]
    users_collection = db.users
    document_to_find = {"username" : username}
    result = users_collection.find_one(document_to_find)
    client.close()                  # cleanup
    return UserInDb(**result)

async def create_user(user : UserInDb, client : Annotated[MongoClient, Depends(load_cluster)]):
    payload = {
        "username" : user.username,
        "full_name" : user.full_name,
        "password" : user.password,
        "email" : user.email,
        "disabled" : user.disabled
    }

    db = client["Authentication"]
    users_collection = db.users
    users_collection.insert_one(payload)
    client.close()


async def find_user_by_email(email : str, client : Annotated[MongoClient, Depends(load_cluster)]):
    db = client["Authentication"]
    users_collection = db.users
    document_to_find = {"email" : email}
    result = users_collection.find_one(document_to_find)
    client.close()                  # cleanup
    return UserInDb(**result)


