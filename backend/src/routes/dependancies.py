from fastapi import Depends, Request
from typing import Annotated
from pymongo import MongoClient

async def load_mongo(request : Request) -> MongoClient:
    return request.app.state.mongo_client

MONGO_DEP = Annotated[MongoClient, Depends(load_mongo)]