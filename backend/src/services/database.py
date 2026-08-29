from pymongo import MongoClient
from fastapi import Depends
from typing import Annotated
from src.models.pydantic import UserInDb
from dotenv import load_dotenv
import os
import uuid

load_dotenv()
MONGO_KEY = os.getenv("MONGO_KEY")

MONGO_URI = f"mongodb+srv://ifigeneiamanolou26_db_user:{MONGO_KEY}@closetcluster.6sudtpr.mongodb.net/?appName=ClosetCluster"

async def load_cluster():
    client = MongoClient(MONGO_URI)
    try:
        yield client
    finally:
        client.close()

async def find_user(username : str, client : MongoClient):
    db = client["Authentication"]
    users_collection = db.users
    document_to_find = {"username" : username}
    result = users_collection.find_one(document_to_find)

    if result is None:
        return None
    return UserInDb(**result)

async def create_user(user : UserInDb, client : MongoClient):
    payload = {
        "id" : str(uuid.uuid4()),
        "username" : user.username,
        "full_name" : user.full_name,
        "password" : user.password,
        "email" : user.email,
        "token_version" : user.token_version
    }

    db = client["Authentication"]
    users_collection = db.users
    users_collection.insert_one(payload)

async def find_user_by_email(email : str, client : MongoClient):
    db = client["Authentication"]
    users_collection = db.users
    document_to_find = {"email" : email}
    result = users_collection.find_one(document_to_find)

    if result is None:
        return None
    return UserInDb(**result)

async def change_password(username : str, password : str, client : MongoClient):
    db = client["Authentication"]
    query_filter = {'username' : username}
    update_operation = {
        '$set' : {'password' : password},
        '$inc' : {'token_version' : 1}
    }
    db.users.update_one(query_filter, update_operation)