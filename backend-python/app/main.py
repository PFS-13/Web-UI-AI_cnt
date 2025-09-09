from fastapi import FastAPI
from app.api import routes
from fastapi.middleware.cors import CORSMiddleware
from app.service.cache import redis_client
from app.service.search import es_client

app = FastAPI(title="My Project API")

# Izinkan frontend React (misalnya di port 3000) mengakses backend
origins = [
    "http://localhost:3000",   # React dev
    "http://127.0.0.1:3000",   # React dev (varian lain)
    "http://localhost:5173",   # React + Vite
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # domain yg diizinkan
    allow_credentials=True,
    allow_methods=["*"],         # izinkan semua method (GET, POST, OPTIONS, dll)
    allow_headers=["*"],         # izinkan semua headers
)

# daftar router
app.include_router(routes.router, prefix="/api")

@app.on_event("startup")
async def startup():
    # check redis & elastic connection
    print("App started without Redis check")

