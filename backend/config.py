import os
from dotenv import load_dotenv

load_dotenv()


class Config:

    # ── Paths ─────────────────────────────────────────────────────────────
    OUTPUT_DIR = os.getenv("OUTPUT_DIR", "outputs")
    DATA_DIR   = os.getenv("DATA_DIR",   "data")

    # ── Network ───────────────────────────────────────────────────────────
    BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")

    # ── Providers ─────────────────────────────────────────────────────────
    POLLINATIONS_API_KEY  = os.getenv("POLLINATIONS_API_KEY", "")
    POLLINATIONS_BASE_URL = "https://gen.pollinations.ai/v1"

    OPENAI_API_KEY   = os.getenv("OPENAI_API_KEY", "")
    HF_API_KEY       = os.getenv("HF_API_KEY", "")
    COMFYUI_BASE_URL = os.getenv("COMFYUI_BASE_URL", "http://127.0.0.1:8188")
    OLLAMA_BASE_URL  = os.getenv("OLLAMA_BASE_URL",  "http://127.0.0.1:11434")

    # ── Defaults ──────────────────────────────────────────────────────────
    DEFAULT_MODEL = os.getenv("IMAGE_MODEL", "flux")

    # ── Admin ─────────────────────────────────────────────────────────────
    ADMIN_SECRET       = os.getenv("ADMIN_SECRET", "changeme")
    STORAGE_TOTAL_BYTES = int(os.getenv("STORAGE_TOTAL_BYTES", str(500 * 1024 ** 3)))
    API_VERSION        = "1.5.0"
    ENVIRONMENT        = os.getenv("ENVIRONMENT", "development")

    # ── Data file helpers ─────────────────────────────────────────────────
    @classmethod
    def data_path(cls, filename: str) -> str:
        return os.path.join(cls.DATA_DIR, filename)

    @classmethod
    def init_directories(cls):
        os.makedirs(cls.OUTPUT_DIR, exist_ok=True)
        os.makedirs(cls.DATA_DIR,   exist_ok=True)