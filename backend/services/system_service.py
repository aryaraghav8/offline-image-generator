from __future__ import annotations

import json
import logging
import os
import platform
import uuid
from datetime import datetime
from pathlib import Path

from config import Config

LOGS_FILE = Path(Config.DATA_DIR) / "system_logs.json"

logger = logging.getLogger("system_service")


def _load_logs() -> list[dict]:
    if not LOGS_FILE.exists():
        return []
    with open(LOGS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_logs(logs: list[dict]) -> None:
    LOGS_FILE.parent.mkdir(parents=True, exist_ok=True)
    # Keep last 500 entries
    with open(LOGS_FILE, "w", encoding="utf-8") as f:
        json.dump(logs[-500:], f, indent=2)


def append_log(level: str, message: str, source: str = "api") -> None:
    logs = _load_logs()
    logs.append({
        "id": f"log-{uuid.uuid4().hex[:8]}",
        "level": level,
        "message": message,
        "source": source,
        "timestamp": datetime.now().isoformat(),
    })
    _save_logs(logs)


def _cpu_usage() -> float:
    try:
        import psutil
        return psutil.cpu_percent(interval=0.1)
    except ImportError:
        return 0.0


def _memory_info() -> tuple[float, float]:
    """Return (usage_percent, total_gb)."""
    try:
        import psutil
        vm = psutil.virtual_memory()
        return vm.percent, round(vm.total / 1024 ** 3, 1)
    except ImportError:
        return 0.0, 0.0


def _gpu_usage() -> float | None:
    try:
        import subprocess
        result = subprocess.run(
            ["nvidia-smi", "--query-gpu=utilization.gpu", "--format=csv,noheader,nounits"],
            capture_output=True, text=True, timeout=2,
        )
        if result.returncode == 0:
            return float(result.stdout.strip().split("\n")[0])
    except Exception:
        pass
    return None


def get_system_overview() -> dict:
    cpu = _cpu_usage()
    mem_usage, mem_total = _memory_info()
    gpu = _gpu_usage()
    logs = _load_logs()

    return {
        "services": [
            {
                "id": "api",
                "name": "API Server",
                "description": "FastAPI application server",
                "state": "healthy",
                "uptime": "running",
                "version": Config.API_VERSION,
            },
            {
                "id": "storage",
                "name": "Storage Service",
                "description": "File and metadata storage",
                "state": "healthy",
                "uptime": "running",
                "version": Config.API_VERSION,
            },
        ],
        "cpuUsage": cpu,
        "memoryUsage": mem_usage,
        "memoryTotalGb": mem_total,
        "gpuUsage": gpu,
        "apiVersion": Config.API_VERSION,
        "environment": Config.ENVIRONMENT,
        "platform": platform.system(),
        "pythonVersion": platform.python_version(),
        "logs": list(reversed(logs[-50:])),  # newest first, last 50
    }


def restart_service(service_id: str) -> dict:
    # For a real restart we'd signal the supervisor / systemd.
    # Here we log the action and return a "healthy" state.
    append_log("info", f"Service '{service_id}' restart requested via admin UI", source="admin")
    overview = get_system_overview()
    overview["services"] = [
        {**s, "state": "healthy", "uptime": "0m"} if s["id"] == service_id else s
        for s in overview["services"]
    ]
    return overview
