from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from src.routes.auth import router as auth_router
from src.routes.save import router as save_router
from src.routes.loadResources import router as load_router
from src.config.cache import init_redis, close

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_redis()
    yield
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host = "0.0.0.0", port = 8000)




