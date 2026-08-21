from fastapi import FastAPI, asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware 
from src.routes.auth import router as auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start up code

    yield

    # Shutdown code

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host = "0.0.0.0", port = "8000")




