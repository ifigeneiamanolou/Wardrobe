from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from src.routes.auth import router as auth_router
from src.routes.save import router as save_router
from src.routes.loadResources import router as load_router
from src.config.cache import init_redis, close
from src.services.notificationsServices import check_for_receipts
from src.routes.notifications import router as notification_router
from src.routes.edit import router as edit_router
from src.services.database import load_cluster
import asyncio

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_redis()
    client = await asyncio.to_thread(load_cluster)        # Blocking operation
    app.state.mongo_client = client
    task = asyncio.create_task(check_for_receipts(client))
    yield

    task.cancel()
    client.close()
    await close()

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host = "0.0.0.0", port = 8000)




