from contextlib import asynccontextmanager
from json import load
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware 
from src.WardrobeBackend.routes.auth import router as auth_router
from src.WardrobeBackend.routes.save import router as save_router
from src.WardrobeBackend.routes.loadResources import router as load_router
from src.WardrobeBackend.utils.redis_pool import create_pool, close_pool, generate_client
from src.WardrobeBackend.services.notificationsServices import check_for_receipts
from src.WardrobeBackend.routes.notifications import router as notification_router
from src.WardrobeBackend.routes.edit import router as edit_router
from src.WardrobeBackend.services.database import load_cluster
from src.WardrobeBackend.services.feed import update_feed_daily
from typing import Annotated
from redis.asyncio import Redis
import asyncio
from redis.exceptions import ConnectionError

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_pool()
    client = await load_cluster()
    app.state.mongo_client = client                     # Persist mongodb client
    task = asyncio.create_task(check_for_receipts(client))      # Check push receipts
    feed_task = asyncio.create_task(update_feed_daily(client))   # Update feed

    yield           # Run the server

    task.cancel()
    feed_task.cancel()
    await client.close()
    await close_pool()

app = FastAPI(lifespan = lifespan) 

# Add CORS middleware 
app.add_middleware( 
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"]
)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(save_router, prefix = "/save", tags = ["save"])
app.include_router(load_router, prefix = "/load", tags = ["load"])
app.include_router(edit_router, prefix = "/edit", tags = ["edit"])
app.include_router(notification_router, prefix = "/notifications", tags = ["notifications"])

@app.get("/health")
async def get_message(redis_client : Annotated[Redis, Depends(generate_client)]):
    try:
        await redis_client.ping()
        return {"state" : "healthy", "redis" : "connected"}
    except ConnectionError:
        return {"state" : "unhealthy", "redis" : "disconnected"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host = "0.0.0.0", port = 8000)




