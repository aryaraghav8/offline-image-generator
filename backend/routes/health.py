from fastapi import APIRouter
from config import Config

router = APIRouter(tags=["health"])


@router.get("/api/health")
async def health():
    return {
        "status": "ok",
        "version": Config.API_VERSION,
        "environment": Config.ENVIRONMENT,
    }
