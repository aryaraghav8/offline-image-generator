from dotenv import load_dotenv
from openai import OpenAI
from datetime import datetime
from pathlib import Path
import json
import base64
import os

from fastapi import FastAPI
from fastapi import HTTPException
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from routes.models import router as models_router
from routes.generate import generate as generate_router
from routes.health import health as health_router
from routes.settings import (router as settings_router,)
from services.generation_service import generate_image 
from models.generate_schema import GenerateRequest


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

OUTPUT_DIR = os.getenv("OUTPUT_DIR", "outputs")
IMAGE_MODEL = os.getenv("IMAGE_MODEL", "flux")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Serve generated images
app.mount(
    "/outputs",
    StaticFiles(directory=OUTPUT_DIR),
    name="outputs"
)

# Pollinations Client
client = OpenAI(
    api_key=os.getenv("POLLINATIONS_API_KEY"),
    base_url="https://gen.pollinations.ai/v1"
)

app.include_router(models_router)
app.include_router(settings_router)




os.makedirs(OUTPUT_DIR, exist_ok=True)

# Serve generated images
app.mount(
    "/outputs",
    StaticFiles(directory=OUTPUT_DIR),
    name="outputs"
)


@app.post("/api/generate")
async def generate(data: GenerateRequest):

    result = generate_image(data)

    print("generate main")
    if not result["success"]:
        raise HTTPException(
            status_code=400,
            detail=result["error"]
        )

    return result
        
@app.get("/api/health")
def healthYou():
    result = health_router()
    print("result is : ", result)
    return result

@app.get("/api/images")
async def get_images():

    metadata_file = "data/images.json"

    if not os.path.exists(metadata_file):
        return []

    with open(metadata_file, "r") as f:
        images = json.load(f)
    
    images.sort(
        key = lambda x: x["createdAt"],
        reverse=True
    )
    
    return images