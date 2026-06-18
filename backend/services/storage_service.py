from __future__ import annotations

import json
import os
import shutil
import time
from datetime import datetime, timedelta
from pathlib import Path

from config import Config
from fastapi import HTTPException

STORAGE_FILE = Path(Config.DATA_DIR) / "storage_policy.json"

_DEFAULT_POLICY: dict = {
    "retentionDays": 90,
    "autoCleanupEnabled": True,
    "lastCleanupAt": None,
}


def _load_policy() -> dict:
    if not STORAGE_FILE.exists():
        _save_policy(_DEFAULT_POLICY)
        return dict(_DEFAULT_POLICY)
    with open(STORAGE_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_policy(policy: dict) -> None:
    STORAGE_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(STORAGE_FILE, "w", encoding="utf-8") as f:
        json.dump(policy, f, indent=2)


def _dir_stats(path: str) -> tuple[int, int]:
    """Return (total_bytes, file_count) for a directory."""
    total_bytes = 0
    file_count = 0
    if os.path.isdir(path):
        for root, _, files in os.walk(path):
            for fname in files:
                try:
                    total_bytes += os.path.getsize(os.path.join(root, fname))
                    file_count += 1
                except OSError:
                    pass
    return total_bytes, file_count


def get_storage_overview() -> dict:
    policy = _load_policy()

    outputs_bytes, outputs_count = _dir_stats(Config.OUTPUT_DIR)
    models_bytes,  models_count  = _dir_stats("models")
    data_bytes,    data_count    = _dir_stats(Config.DATA_DIR)

    used_bytes = outputs_bytes + models_bytes + data_bytes

    return {
        "totalCapacityBytes": Config.STORAGE_TOTAL_BYTES,
        "usedBytes": used_bytes,
        "buckets": [
            {
                "id": "outputs",
                "label": "Generated Images",
                "path": Config.OUTPUT_DIR,
                "usedBytes": outputs_bytes,
                "fileCount": outputs_count,
            },
            {
                "id": "models",
                "label": "Model Weights",
                "path": "models/",
                "usedBytes": models_bytes,
                "fileCount": models_count,
            },
            {
                "id": "data",
                "label": "Metadata & Logs",
                "path": Config.DATA_DIR,
                "usedBytes": data_bytes,
                "fileCount": data_count,
            },
        ],
        "retentionDays": policy["retentionDays"],
        "autoCleanupEnabled": policy["autoCleanupEnabled"],
        "lastCleanupAt": policy["lastCleanupAt"],
    }


def update_retention_policy(retention_days: int, auto_cleanup: bool) -> dict:
    policy = _load_policy()
    policy["retentionDays"] = retention_days
    policy["autoCleanupEnabled"] = auto_cleanup
    _save_policy(policy)
    return get_storage_overview()


def run_cleanup() -> dict:
    """Delete generated images older than retentionDays and their metadata."""
    policy = _load_policy()
    cutoff = datetime.now() - timedelta(days=policy["retentionDays"])

    images_file = Path(Config.DATA_DIR) / "images.json"
    if images_file.exists():
        with open(images_file, "r", encoding="utf-8") as f:
            images = json.load(f)

        kept = []
        for img in images:
            created = datetime.fromisoformat(img.get("createdAt", datetime.now().isoformat()))
            if created >= cutoff:
                kept.append(img)
            else:
                # Remove the image file
                fname = img["url"].split("/outputs/")[-1] if "/outputs/" in img.get("url", "") else f"{img['id']}.png"
                fpath = os.path.join(Config.OUTPUT_DIR, fname)
                if os.path.exists(fpath):
                    os.remove(fpath)

        with open(images_file, "w", encoding="utf-8") as f:
            json.dump(kept, f, indent=2)

    policy["lastCleanupAt"] = datetime.now().isoformat()
    _save_policy(policy)
    return get_storage_overview()
