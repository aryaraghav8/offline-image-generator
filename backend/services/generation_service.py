from __future__ import annotations

import base64
import json
import logging
import os
import uuid
from datetime import datetime

from openai import OpenAI

from config import Config

logger = logging.getLogger(__name__)

_client = OpenAI(
    api_key=Config.POLLINATIONS_API_KEY or "dummy",
    base_url=Config.POLLINATIONS_BASE_URL,
)

METADATA_FILE = Config.data_path("images.json")


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _load_images() -> list[dict]:
    if not os.path.exists(METADATA_FILE):
        return []
    try:
        with open(METADATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def _save_images(images: list[dict]) -> None:
    os.makedirs(Config.DATA_DIR, exist_ok=True)
    with open(METADATA_FILE, "w", encoding="utf-8") as f:
        json.dump(images, f, indent=2)


# ─── Generation ───────────────────────────────────────────────────────────────

def generate_image(data) -> dict:
    try:
        start_time = datetime.now()

        # Build extra kwargs Pollinations accepts (ignored silently if unsupported)
        extra: dict = {}
        if not data.randomSeed and data.seed is not None:
            extra["seed"] = data.seed

        result = _client.images.generate(
            model=data.model,
            prompt=data.prompt,
            size=f"{data.width}x{data.height}",
            n=1,
            **extra,
        )

        image_bytes = base64.b64decode(result.data[0].b64_json)

        image_id = str(uuid.uuid4())
        filename = f"{image_id}.png"
        output_path = os.path.join(Config.OUTPUT_DIR, filename)
        os.makedirs(Config.OUTPUT_DIR, exist_ok=True)

        with open(output_path, "wb") as f:
            f.write(image_bytes)

        generation_time = (datetime.now() - start_time).total_seconds()
        image_url = f"{Config.BASE_URL}/outputs/{filename}"

        image_data = {
            "id": image_id,
            "url": image_url,
            "prompt": data.prompt,
            "negativePrompt": data.negativePrompt or "",
            "model": data.model,
            "params": {
                "width": data.width,
                "height": data.height,
                "steps": data.steps,
                "cfgScale": data.cfgScale,
                "seed": data.seed,
                "randomSeed": data.randomSeed,
                "count": data.count,
            },
            "createdAt": datetime.now().isoformat(),
            "generationTime": generation_time,
            "isFavorite": False,
        }

        images = _load_images()
        images.insert(0, image_data)
        _save_images(images)

        return {"success": True, "imageUrl": image_url, "image": image_data}

    except Exception as e:
        logger.exception("Generation failed")
        return {"success": False, "error": str(e)}


# ─── Gallery ──────────────────────────────────────────────────────────────────

def get_gallery() -> list[dict]:
    return _load_images()


def get_image(image_id: str) -> dict | None:
    images = _load_images()
    return next((img for img in images if img["id"] == image_id), None)


def delete_image(image_id: str) -> bool:
    images = _load_images()
    new_images = [img for img in images if img["id"] != image_id]
    if len(new_images) == len(images):
        return False

    # Remove file from disk
    filename = f"{image_id}.png"
    filepath = os.path.join(Config.OUTPUT_DIR, filename)
    if os.path.exists(filepath):
        os.remove(filepath)

    _save_images(new_images)
    return True


def toggle_favorite(image_id: str) -> dict | None:
    images = _load_images()
    for img in images:
        if img["id"] == image_id:
            img["isFavorite"] = not img.get("isFavorite", False)
            _save_images(images)
            return img
    return None


def get_favorites() -> list[dict]:
    return [img for img in _load_images() if img.get("isFavorite")]


def get_image_path(image_id: str) -> str | None:
    filename = f"{image_id}.png"
    path = os.path.join(Config.OUTPUT_DIR, filename)
    return path if os.path.exists(path) else None
