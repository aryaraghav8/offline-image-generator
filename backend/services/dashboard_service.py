from __future__ import annotations

import json
from datetime import datetime, timedelta
from pathlib import Path

from config import Config
from services.model_service import admin_get_models
from services.provider_service import get_providers

IMAGES_FILE = Path(Config.DATA_DIR) / "images.json"
ACTIVITY_FILE = Path(Config.DATA_DIR) / "activity_log.json"


def _load_images() -> list[dict]:
    if not IMAGES_FILE.exists():
        return []
    with open(IMAGES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _load_activity() -> list[dict]:
    if not ACTIVITY_FILE.exists():
        return []
    with open(ACTIVITY_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def record_activity(actor: str, action: str, target: str) -> None:
    activity = _load_activity()
    activity.insert(0, {
        "id": f"act-{len(activity) + 1}",
        "actor": actor,
        "action": action,
        "target": target,
        "timestamp": datetime.now().isoformat(),
    })
    ACTIVITY_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(ACTIVITY_FILE, "w", encoding="utf-8") as f:
        json.dump(activity[:100], f, indent=2)  # keep last 100


def get_dashboard() -> dict:
    images = _load_images()
    now = datetime.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    today_images = [
        img for img in images
        if datetime.fromisoformat(img.get("createdAt", "2000-01-01")) >= today_start
    ]

    gen_times = [img["generationTime"] for img in images if img.get("generationTime")]
    avg_time = round(sum(gen_times) / len(gen_times), 1) if gen_times else 0.0

    # Weekly trend — count images per day for last 7 days
    trend = []
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = sum(
            1 for img in images
            if day_start <= datetime.fromisoformat(img.get("createdAt", "2000-01-01")) < day_end
        )
        trend.append({"label": day.strftime("%a"), "value": count})

    models = admin_get_models()
    active_models = sum(1 for m in models if m.get("status") == "active")

    providers = get_providers()
    connected_providers = sum(1 for p in providers if p.get("status") == "connected")

    activity = _load_activity()[:10]

    return {
        "totalGenerationsToday": len(today_images),
        "totalGenerationsAllTime": len(images),
        "activeModels": active_models,
        "connectedProviders": connected_providers,
        "failureRate24h": 0.0,
        "avgGenerationTimeSec": avg_time,
        "generationsTrend": trend,
        "recentActivity": activity,
    }
