from fastapi import APIRouter
from pathlib import Path
import json

router = APIRouter(tags=["settings"])

SETTINGS_FILE = Path("data/settings.json")


def load_settings():
    if not SETTINGS_FILE.exists():
        return {
            "settings": {
                "theme": "dark",
                "gridSize": "md",
                "defaultModel": "flux",
                "defaultWidth": 1024,
                "defaultHeight": 1024,
                "defaultSteps": 20,
                "defaultCfgScale": 7.5,
                "autoSavePrompts": True,
                "notifications": {
                    "generationComplete": True,
                    "generationFailed": True,
                    "updates": False,
                },
            },
            "apiSettings": {
                "provider": "local",
                "apiKey": "",
                "baseUrl": "http://localhost:5000",
            },
            "localSettings": {
                "enabled": True,
                "type": "ollama",
                "baseUrl": "http://localhost",
                "port": 11434,
            },
        }

    with open(
        SETTINGS_FILE,
        "r",
        encoding="utf-8",
    ) as f:
        return json.load(f)


def save_settings(data):
    SETTINGS_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with open(
        SETTINGS_FILE,
        "w",
        encoding="utf-8",
    ) as f:
        json.dump(
            data,
            f,
            indent=2,
        )


@router.get("/api/settings")
async def get_settings():
    return load_settings()


@router.put("/api/settings")
async def update_settings(
    data: dict,
):
    save_settings(data)

    return data