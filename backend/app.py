from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from config import Config

from routes.generate import router as generate_router
from routes.gallery import router as gallery_router
from routes.health import router as health_router

Config.init_directories()

app = FastAPI(
    title="AI Image Generator API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.mount(
    "/outputs",
    StaticFiles(directory=Config.OUTPUT_DIR),
    name="outputs"
)

app.include_router(generate_router)
app.include_router(gallery_router)
app.include_router(health_router)