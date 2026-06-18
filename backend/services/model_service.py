from __future__ import annotations

import json
from pathlib import Path
from fastapi import HTTPException

MODELS_FILE = Path("data/models.json")

_DEFAULT_MODELS: list[dict] = [
    {
        "id": "flux",
        "displayName": "Flux Dev",
        "slug": "flux",
        "description": "State-of-the-art text-to-image model with excellent prompt adherence and photorealism.",
        "provider": "Pollinations",
        "category": "text-to-image",
        "status": "active",
        "size": "23.8 GB",
        "vram": 24,
        "visibleToUsers": True,
        "isDefault": True,
        "usageCount": 0,
        "lastUsed": None,
        "addedAt": "2026-02-11T10:00:00Z",
        "version": "1.0",
        "installed": True,
    },
    {
        "id": "flux-schnell",
        "displayName": "Flux Schnell",
        "slug": "flux-schnell",
        "description": "Fast Flux variant optimized for rapid iteration with strong visual quality.",
        "provider": "Pollinations",
        "category": "text-to-image",
        "status": "active",
        "size": "23.8 GB",
        "vram": 16,
        "visibleToUsers": True,
        "isDefault": False,
        "usageCount": 0,
        "lastUsed": None,
        "addedAt": "2026-02-11T10:00:00Z",
        "version": "1.0",
        "installed": True,
    },
    {
        "id": "stable-diffusion",
        "displayName": "Stable Diffusion XL",
        "slug": "stable-diffusion-xl",
        "description": "High-resolution general model with broad style coverage.",
        "provider": "Local · ComfyUI",
        "category": "text-to-image",
        "status": "active",
        "size": "6.5 GB",
        "vram": 10,
        "visibleToUsers": True,
        "isDefault": False,
        "usageCount": 0,
        "lastUsed": None,
        "addedAt": "2026-03-02T10:00:00Z",
        "version": "1.0",
        "installed": True,
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
    """Return only models visible to end users."""
    return [m for m in _load() if m.get("visibleToUsers", True)]


def get_model(model_id: str) -> dict:
    model = next((m for m in _load() if m["id"] == model_id), None)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return model


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

    # If setting as default, clear other defaults first
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
    found = any(m["id"] == model_id for m in models)
    if not found:
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
    import re
    from datetime import datetime, timezone

    models = _load()

    # Derive a slug / id from displayName
    slug = re.sub(r"[^a-z0-9]+", "-", source["displayName"].lower()).strip("-")
    model_id = slug
    # Ensure uniqueness
    existing_ids = {m["id"] for m in models}
    suffix = 1
    while model_id in existing_ids:
        model_id = f"{slug}-{suffix}"
        suffix += 1

    kind = source.get("kind", "api")
    if kind == "huggingface":
        provider = f"Hugging Face · {source.get('hfRepo', '').split('/')[0] or 'HF'}"
    elif kind == "local":
        provider = "Local · Custom"
    else:
        # Derive provider from baseUrl hostname if available
        base_url = source.get("baseUrl", "")
        try:
            from urllib.parse import urlparse
            hostname = urlparse(base_url).hostname or "API"
            provider = hostname.replace("www.", "").split(".")[0].capitalize()
        except Exception:
            provider = "API"

    new_model: dict = {
        "id": model_id,
        "displayName": source["displayName"],
        "slug": slug,
        "description": source.get("description") or "",
        "provider": provider,
        "category": "text-to-image",
        "status": "active",
        "size": "Unknown",
        "vram": source.get("vram", 8),
        "visibleToUsers": True,
        "isDefault": False,
        "usageCount": 0,
        "lastUsed": None,
        "addedAt": datetime.now(timezone.utc).isoformat(),
        "version": "1.0",
        "installed": True,
        # Source-specific metadata (not exposed to users)
        "sourceKind": kind,
        "baseUrl": source.get("baseUrl", ""),
        "modelId": source.get("modelId", ""),
        "hfRepo": source.get("hfRepo", ""),
    }

    models.append(new_model)
    _save(models)
    return new_model


def increment_usage(model_id: str) -> None:
    """Called after a successful generation to track usage count."""
    try:
        models = _load()
        from datetime import datetime
        for m in models:
            if m["id"] == model_id:
                m["usageCount"] = m.get("usageCount", 0) + 1
                m["lastUsed"] = datetime.now().isoformat()
        _save(models)
    except Exception:
        pass  # usage tracking is best-effort
