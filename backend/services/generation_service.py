from __future__ import annotations

import json
import logging
import os
import uuid
from datetime import datetime

from config import Config
from services.model_service import get_model_record

logger = logging.getLogger(__name__)

METADATA_FILE = Config.data_path("images.json")


# ─── Image metadata helpers ───────────────────────────────────────────────────

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


# ─── Backend router ───────────────────────────────────────────────────────────

def _call_backend(model: dict, data) -> bytes:
    """
    Inspect model['sourceKind'] and dispatch to the right provider backend.

    sourceKind values:
      "api"          → Pollinations (openai-compat, default)
      "local"        → ComfyUI running locally
      "ollama"       → Ollama running locally (OpenAI-compat /v1/images/generations)
      "huggingface"  → Hugging Face Inference API
      "openai"       → OpenAI DALL-E API
    """
    kind = (model.get("sourceKind") or "api").lower()
    seed = None if data.randomSeed else data.seed

    common = dict(
        prompt=data.prompt,
        width=data.width,
        height=data.height,
        steps=data.steps,
        cfg_scale=data.cfgScale,
        seed=seed,
    )

    if kind == "ollama":
        from services.providers.ollama_backend import generate
        return generate(
            model_id=model.get("modelId") or model["id"],
            base_url=model.get("baseUrl", ""),
            **common,
        )

    if kind == "local":
        from services.providers.comfyui_backend import generate
        return generate(
            model_id=model.get("modelId") or model["id"],
            base_url=model.get("baseUrl", ""),
            **common,
        )

    if kind == "huggingface":
        from services.providers.huggingface_backend import generate
        return generate(
            model_id=model.get("modelId") or model["id"],
            hf_repo=model.get("hfRepo", ""),
            **common,
        )

    if kind == "openai":
        from services.providers.openai_backend import generate
        return generate(
            model_id=model.get("modelId") or model["id"],
            **common,
        )

    # Default: Pollinations (kind == "api" or anything unrecognised)
    from services.providers.pollinations_backend import generate
    return generate(
        model_id=model.get("modelId") or model["id"],
        **common,
    )


# ─── Generation ───────────────────────────────────────────────────────────────

def generate_image(data) -> dict:
    try:
        start_time = datetime.now()

        # Look up full model record so we know its sourceKind / routing fields
        model = get_model_record(data.model)
        if not model:
            return {"success": False, "error": f"Unknown model '{data.model}'"}

        image_bytes = _call_backend(model, data)

        image_id  = str(uuid.uuid4())
        filename  = f"{image_id}.png"
        output_path = os.path.join(Config.OUTPUT_DIR, filename)
        os.makedirs(Config.OUTPUT_DIR, exist_ok=True)

        with open(output_path, "wb") as f:
            f.write(image_bytes)

        generation_time = (datetime.now() - start_time).total_seconds()
        image_url = f"{Config.BASE_URL}/outputs/{filename}"

        image_data = {
            "id":             image_id,
            "url":            image_url,
            "prompt":         data.prompt,
            "negativePrompt": data.negativePrompt or "",
            "model":          data.model,
            "sourceKind":     model.get("sourceKind", "api"),
            "params": {
                "width":      data.width,
                "height":     data.height,
                "steps":      data.steps,
                "cfgScale":   data.cfgScale,
                "seed":       data.seed,
                "randomSeed": data.randomSeed,
                "count":      data.count,
            },
            "createdAt":      datetime.now().isoformat(),
            "generationTime": generation_time,
            "isFavorite":     False,
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
    return next((img for img in _load_images() if img["id"] == image_id), None)


def delete_image(image_id: str) -> bool:
    images = _load_images()
    new_images = [img for img in images if img["id"] != image_id]
    if len(new_images) == len(images):
        return False
    filepath = os.path.join(Config.OUTPUT_DIR, f"{image_id}.png")
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
    path = os.path.join(Config.OUTPUT_DIR, f"{image_id}.png")
    return path if os.path.exists(path) else None