from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

from fastapi import HTTPException

MODELS_FILE = Path("data/models.json")

_DEFAULT_MODELS: list[dict] = [
    {
        "id":             "flux",
        "displayName":    "Flux Dev",
        "slug":           "flux",
        "description":    "State-of-the-art text-to-image model with excellent prompt adherence and photorealism.",
        "provider":       "Pollinations",
        "category":       "text-to-image",
        "status":         "active",
        "size":           "23.8 GB",
        "vram":           24,
        "visibleToUsers": True,
        "isDefault":      True,
        "usageCount":     0,
        "lastUsed":       None,
        "addedAt":        "2026-02-11T10:00:00Z",
        "version":        "1.0",
        "installed":      True,
        # ── routing fields ──────────────────────────────────────────
        "sourceKind":     "api",      # "api" | "local" | "huggingface" | "openai"
        "baseUrl":        "",         # override provider URL (local / custom API)
        "modelId":        "flux",     # model string sent to the backend
        "hfRepo":         "",         # only used when sourceKind == "huggingface"
    },
    {
        "id":             "flux-schnell",
        "displayName":    "Flux Schnell",
        "slug":           "flux-schnell",
        "description":    "Fast Flux variant optimised for rapid iteration with strong visual quality.",
        "provider":       "Pollinations",
        "category":       "text-to-image",
        "status":         "active",
        "size":           "23.8 GB",
        "vram":           16,
        "visibleToUsers": True,
        "isDefault":      False,
        "usageCount":     0,
        "lastUsed":       None,
        "addedAt":        "2026-02-11T10:00:00Z",
        "version":        "1.0",
        "installed":      True,
        "sourceKind":     "api",
        "baseUrl":        "",
        "modelId":        "flux-schnell",
        "hfRepo":         "",
    },
    {
        "id":             "stable-diffusion",
        "displayName":    "Stable Diffusion XL",
        "slug":           "stable-diffusion-xl",
        "description":    "High-resolution general model with broad style coverage, running locally via ComfyUI.",
        "provider":       "Local · ComfyUI",
        "category":       "text-to-image",
        "status":         "active",
        "size":           "6.5 GB",
        "vram":           10,
        "visibleToUsers": True,
        "isDefault":      False,
        "usageCount":     0,
        "lastUsed":       None,
        "addedAt":        "2026-03-02T10:00:00Z",
        "version":        "1.0",
        "installed":      True,
        "sourceKind":     "local",
        "baseUrl":        "http://127.0.0.1:8188",
        "modelId":        "sd_xl_base_1.0.safetensors",
        "hfRepo":         "",
    },
    {
        "id":             "dall-e-3",
        "displayName":    "DALL·E 3",
        "slug":           "dall-e-3",
        "description":    "OpenAI's highest-quality image generation model.",
        "provider":       "OpenAI",
        "category":       "text-to-image",
        "status":         "active",
        "size":           "—",
        "vram":           0,
        "visibleToUsers": True,
        "isDefault":      False,
        "usageCount":     0,
        "lastUsed":       None,
        "addedAt":        "2026-03-02T10:00:00Z",
        "version":        "3",
        "installed":      True,
        "sourceKind":     "openai",
        "baseUrl":        "",
        "modelId":        "dall-e-3",
        "hfRepo":         "",
    },
    {
        "id":             "ollama-flux",
        "displayName":    "FLUX (Ollama)",
        "slug":           "ollama-flux",
        "description":    "FLUX.1-dev running locally via Ollama. Pull with: ollama pull hf.co/black-forest-labs/FLUX.1-dev",
        "provider":       "Local · Ollama",
        "category":       "text-to-image",
        "status":         "active",
        "size":           "~24 GB",
        "vram":           12,
        "visibleToUsers": True,
        "isDefault":      False,
        "usageCount":     0,
        "lastUsed":       None,
        "addedAt":        "2026-06-01T10:00:00Z",
        "version":        "1.0",
        "installed":      False,
        "sourceKind":     "ollama",
        "baseUrl":        "http://127.0.0.1:11434",
        "modelId":        "hf.co/black-forest-labs/FLUX.1-dev",
        "hfRepo":         "",
    },
]


def _load() -> list[dict]:
    if not MODELS_FILE.exists():
        _save(_DEFAULT_MODELS)
        return list(_DEFAULT_MODELS)
    with open(MODELS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _save(models: list[dict]) -> None:
    MODELS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(MODELS_FILE, "w", encoding="utf-8") as f:
        json.dump(models, f, indent=2)


# ─── User-facing ──────────────────────────────────────────────────────────────

def get_models() -> list[dict]:
    """Return only models visible to end users (routing fields stripped)."""
    public_fields = {
        "id", "displayName", "slug","performance", "description", "provider", "category",
        "status", "size", "vram", "isDefault", "usageCount", "lastUsed",
        "addedAt", "version", "installed",
        # expose sourceKind so the UI can show an 'offline' badge
        "sourceKind",
    }
    return [
        {k: v for k, v in m.items() if k in public_fields}
        for m in _load()
        if m.get("visibleToUsers", True)
    ]


def get_model(model_id: str) -> dict:
    """Public model detail (routing fields stripped)."""
    model = get_model_record(model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    public_fields = {
        "id", "displayName", "slug", "description", "provider", "category",
        "status", "size", "vram", "isDefault", "usageCount", "lastUsed",
        "addedAt", "version", "installed", "sourceKind",
    }
    return {k: v for k, v in model.items() if k in public_fields}


def get_model_record(model_id: str) -> dict | None:
    """Full model record including routing fields — used internally by generation_service."""
    return next((m for m in _load() if m["id"] == model_id), None)


def install_model(model_id: str) -> dict:
    models = _load()
    model = next((m for m in models if m["id"] == model_id), None)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    model["installed"] = True
    model["status"] = "active"
    _save(models)
    return {"success": True, "message": f"{model_id} installed"}


def uninstall_model(model_id: str) -> dict:
    models = _load()
    model = next((m for m in models if m["id"] == model_id), None)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    model["installed"] = False
    model["status"] = "not-installed"
    _save(models)
    return {"success": True, "message": f"{model_id} uninstalled"}


# ─── Admin-facing ─────────────────────────────────────────────────────────────

def admin_get_models() -> list[dict]:
    return _load()


def admin_update_model(model_id: str, updates: dict) -> dict:
    models = _load()
    model = next((m for m in models if m["id"] == model_id), None)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")

    if updates.get("isDefault"):
        for m in models:
            m["isDefault"] = False

    for key, value in updates.items():
        if value is not None:
            model[key] = value

    _save(models)
    return model


def admin_set_default_model(model_id: str) -> list[dict]:
    models = _load()
    if not any(m["id"] == model_id for m in models):
        raise HTTPException(status_code=404, detail="Model not found")
    for m in models:
        m["isDefault"] = m["id"] == model_id
    _save(models)
    return models


def admin_remove_model(model_id: str) -> None:
    models = _load()
    new_models = [m for m in models if m["id"] != model_id]
    if len(new_models) == len(models):
        raise HTTPException(status_code=404, detail="Model not found")
    _save(new_models)


def admin_add_model_source(source: dict) -> dict:
    """Register a new model source and persist it."""
    models = _load()

    slug = re.sub(r"[^a-z0-9]+", "-", source["displayName"].lower()).strip("-")
    model_id = slug
    existing_ids = {m["id"] for m in models}
    suffix = 1
    while model_id in existing_ids:
        model_id = f"{slug}-{suffix}"
        suffix += 1

    kind = source.get("kind", "api")
    if kind == "huggingface":
        provider = f"Hugging Face · {(source.get('hfRepo') or '').split('/')[0] or 'HF'}"
    elif kind == "local":
        provider = "Local · ComfyUI"
    elif kind == "ollama":
        provider = "Local · Ollama"
    elif kind == "openai":
        provider = "OpenAI"
    else:
        base_url = source.get("baseUrl", "")
        try:
            from urllib.parse import urlparse
            hostname = urlparse(base_url).hostname or "API"
            provider = hostname.replace("www.", "").split(".")[0].capitalize()
        except Exception:
            provider = "API"

    new_model: dict = {
        "id":             model_id,
        "displayName":    source["displayName"],
        "slug":           slug,
        "description":    source.get("description") or "",
        "provider":       provider,
        "category":       "text-to-image",
        "status":         "active",
        "size":           "Unknown",
        "vram":           source.get("vram", 8),
        "visibleToUsers": True,
        "isDefault":      False,
        "usageCount":     0,
        "lastUsed":       None,
        "addedAt":        datetime.now(timezone.utc).isoformat(),
        "version":        "1.0",
        "installed":      True,
        # routing fields
        "sourceKind":     kind,
        "baseUrl":        source.get("baseUrl", ""),
        "modelId":        source.get("modelId", ""),
        "hfRepo":         source.get("hfRepo", ""),
    }

    models.append(new_model)
    _save(models)
    return new_model


def increment_usage(model_id: str) -> None:
    """Best-effort usage counter update."""
    try:
        models = _load()
        for m in models:
            if m["id"] == model_id:
                m["usageCount"] = m.get("usageCount", 0) + 1
                m["lastUsed"] = datetime.now().isoformat()
        _save(models)
    except Exception:
        pass