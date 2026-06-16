from dotenv import load_dotenv
from openai import OpenAI
from datetime import datetime
from pathlib import Path
import json

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from routes.models import router as models_router


import base64
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(models_router)

class GenerateRequest(BaseModel):
    prompt: str
    negativePrompt: str | None = None
    model: str = "flux"
    width: int = 1024
    height: int = 1024
    steps: int = 30
    cfgScale: float = 7.0
    seed: int | None = None
    randomSeed: bool = True
    count: int = 1

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

@app.post("/api/generate")
async def generate_image(data: GenerateRequest):

    try:

        result = client.images.generate(
            model = data.model,
            prompt=data.prompt
        )

        image_bytes = base64.b64decode(
            result.data[0].b64_json
        )

        timestamp = datetime.now().strftime(
            "%Y%m%d_%H%M%S"
        )

        filename = f"generated_{timestamp}.png"

        output_path = os.path.join(
            OUTPUT_DIR,
            filename
        )

        with open(output_path, "wb") as f:
            f.write(image_bytes)
            
        os.makedirs("data", exist_ok=True)

        metadata_file = "data/images.json"

        if os.path.exists(metadata_file):
            try:
                with open(metadata_file, "r") as f:
                    images = json.load(f)
            except:
                images = []
        else:
            images = []
            
        images.append({
            "id": timestamp,
            "url": f"http://localhost:8000/outputs/{filename}",
            "prompt": data.prompt,
            "negativePrompt": "",
            "model": data.model,
            "params": {
                "prompt": data.prompt,
                "negativePrompt": "",
                "model": data.model,
                "width": 1024,
                "height": 1024,
                "steps": 30,
                "cfgScale": 7,
                "randomSeed": True,
                "count": 1
            },
            "createdAt": datetime.now().isoformat(),
            "generationTime": 0,
            "isFavorite": False
        })

        with open(metadata_file, "w") as f:
            json.dump(images, f, indent=2)

        return {
            "success": True,
            "imageUrl": f"http://localhost:8000/outputs/{filename}"
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }
        
        
@app.get("/api/health")
def health():
    return {"status": "ok"}

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