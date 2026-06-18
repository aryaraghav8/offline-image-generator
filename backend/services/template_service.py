from __future__ import annotations

import json
import uuid
from datetime import datetime
from pathlib import Path

from config import Config
from fastapi import HTTPException

TEMPLATES_FILE = Path(Config.DATA_DIR) / "templates.json"

_DEFAULT_TEMPLATES: list[dict] = [
    {
        "id": "tpl-cinematic",
        "name": "Cinematic Portrait",
        "category": "Portrait",
        "description": "Dramatic lighting, shallow depth of field, film-still composition.",
        "content": "cinematic portrait of {subject}, dramatic rim lighting, shallow depth of field, anamorphic lens, film grain, 35mm",
        "published": True,
        "usageCount": 0,
        "createdAt": "2026-03-01T09:00:00Z",
        "updatedAt": "2026-03-01T09:00:00Z",
        "author": "Admin",
    },
    {
        "id": "tpl-product",
        "name": "Studio Product Shot",
        "category": "Product",
        "description": "Neutral background product photography with soft studio lighting.",
        "content": "studio product photo of {subject}, seamless white background, soft box lighting, high detail, commercial photography",
        "published": True,
        "usageCount": 0,
        "createdAt": "2026-02-18T09:00:00Z",
        "updatedAt": "2026-02-18T09:00:00Z",
        "author": "Admin",
    },
    {
        "id": "tpl-concept",
        "name": "Sci-fi Concept Art",
        "category": "Concept Art",
        "description": "Wide environment concept art with atmospheric depth.",
        "content": "sci-fi concept art of {subject}, atmospheric depth, volumetric lighting, matte painting, wide angle",
        "published": False,
        "usageCount": 0,
        "createdAt": "2026-06-10T09:00:00Z",
        "updatedAt": "2026-06-10T09:00:00Z",
        "author": "Admin",
    },
]


def _load() -> list[dict]:
    if not TEMPLATES_FILE.exists():
        _save(_DEFAULT_TEMPLATES)
        return list(_DEFAULT_TEMPLATES)
    with open(TEMPLATES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _save(templates: list[dict]) -> None:
    TEMPLATES_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(TEMPLATES_FILE, "w", encoding="utf-8") as f:
        json.dump(templates, f, indent=2)


def get_templates() -> list[dict]:
    return _load()


def upsert_template(payload: dict) -> dict:
    templates = _load()
    now = datetime.now().isoformat()
    tpl_id = payload.get("id") or f"tpl-{uuid.uuid4().hex[:8]}"
    existing = next((t for t in templates if t["id"] == tpl_id), None)

    if existing:
        existing.update({**payload, "updatedAt": now, "id": tpl_id})
        _save(templates)
        return existing
    else:
        new_tpl = {
            **payload,
            "id": tpl_id,
            "usageCount": 0,
            "createdAt": now,
            "updatedAt": now,
        }
        templates.insert(0, new_tpl)
        _save(templates)
        return new_tpl


def set_published(tpl_id: str, published: bool) -> dict:
    templates = _load()
    tpl = next((t for t in templates if t["id"] == tpl_id), None)
    if not tpl:
        raise HTTPException(status_code=404, detail="Template not found")
    tpl["published"] = published
    tpl["updatedAt"] = datetime.now().isoformat()
    _save(templates)
    return tpl


def delete_template(tpl_id: str) -> None:
    templates = _load()
    new_templates = [t for t in templates if t["id"] != tpl_id]
    if len(new_templates) == len(templates):
        raise HTTPException(status_code=404, detail="Template not found")
    _save(new_templates)
