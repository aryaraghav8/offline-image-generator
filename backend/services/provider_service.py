from __future__ import annotations

import json
import os
from pathlib import Path

import httpx

from config import Config

PROVIDERS_FILE = Path(Config.DATA_DIR) / "providers.json"

_DEFAULT_PROVIDERS: list[dict] = [
    {
        "id": "pollinations",
        "name": "Pollinations",
        "kind": "api",
        "description": "Default hosted generation API used for Flux models.",
        "status": "connected",
        "baseUrl": "https://gen.pollinations.ai/v1",
        "hasApiKey": bool(Config.POLLINATIONS_API_KEY),
        "modelsSupplied": 2,
        "requestsToday": 0,
        "lastChecked": None,
        "monthlySpend": 0.0,
        "monthlyBudget": 100.0,
    },
    {
        "id": "comfyui",
        "name": "ComfyUI",
        "kind": "local",
        "description": "Local node-based Stable Diffusion backend running on this machine.",
        "status": "disconnected",
        "baseUrl": "http://127.0.0.1:8188",
        "hasApiKey": False,
        "modelsSupplied": 0,
        "requestsToday": 0,
        "lastChecked": None,
    },
    {
        "id": "ollama",
        "name": "Ollama",
        "kind": "local",
        "description": "Local Ollama runtime for image-generation models (requires Ollama >= 0.5).",
        "status": "disconnected",
        "baseUrl": "http://127.0.0.1:11434",
        "hasApiKey": False,
        "modelsSupplied": 0,
        "requestsToday": 0,
        "lastChecked": None,
    },
    {
        "id": "openai",
        "name": "OpenAI",
        "kind": "api",
        "description": "Optional provider for DALL·E-class generation.",
        "status": "disconnected",
        "baseUrl": "https://api.openai.com/v1",
        "hasApiKey": False,
        "modelsSupplied": 0,
        "requestsToday": 0,
        "lastChecked": None,
        "monthlySpend": 0.0,
        "monthlyBudget": 25.0,
    },
    {
        "id": "huggingface",
        "name": "Hugging Face Inference",
        "kind": "api",
        "description": "Fallback provider for community-hosted checkpoints.",
        "status": "disconnected",
        "baseUrl": "https://api-inference.huggingface.co",
        "hasApiKey": False,
        "modelsSupplied": 0,
        "requestsToday": 0,
        "lastChecked": None,
        "monthlySpend": 0.0,
        "monthlyBudget": 25.0,
    },
]


def _load() -> list[dict]:
    if not PROVIDERS_FILE.exists():
        _save(_DEFAULT_PROVIDERS)
        return list(_DEFAULT_PROVIDERS)
    with open(PROVIDERS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _save(providers: list[dict]) -> None:
    PROVIDERS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(PROVIDERS_FILE, "w", encoding="utf-8") as f:
        json.dump(providers, f, indent=2)


def get_providers() -> list[dict]:
    return _load()


async def test_provider(provider_id: str) -> dict:
    from datetime import datetime
    providers = _load()
    provider = next((p for p in providers if p["id"] == provider_id), None)
    if not provider:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Provider not found")

    url = provider.get("baseUrl", "")
    new_status = "error"

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(url)
            new_status = "connected" if r.status_code < 500 else "error"
    except Exception:
        new_status = "error"

    provider["status"] = new_status
    provider["lastChecked"] = datetime.now().isoformat()
    _save(providers)
    return provider


def set_api_key(provider_id: str, api_key: str) -> dict:
    providers = _load()
    provider = next((p for p in providers if p["id"] == provider_id), None)
    if not provider:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Provider not found")

    # Store whether key was set, NOT the key itself — keys live in .env only
    provider["hasApiKey"] = len(api_key.strip()) > 0
    _save(providers)

    # Write to .env at runtime so restarts pick it up (best-effort)
    _persist_env_key(provider_id, api_key)
    return provider


def _persist_env_key(provider_id: str, key: str) -> None:
    """Write the API key to the running process env. Does NOT write to .env file."""
    env_map = {
        "pollinations": "POLLINATIONS_API_KEY",
        "openai": "OPENAI_API_KEY",
        "huggingface": "HF_API_KEY",
    }
    env_var = env_map.get(provider_id)
    if env_var:
        os.environ[env_var] = key