from fastapi import APIRouter
from services.model_service import (
    get_models,
    get_model,
    install_model,
    uninstall_model,
)

router = APIRouter()


@router.get("/api/models")
async def models():
    return get_models()


@router.get("/api/models/{model_id}")
async def model(model_id: str):
    return get_model(model_id)


@router.post("/api/models/{model_id}/install")
async def install(model_id: str):
    return install_model(model_id)


@router.post("/api/models/{model_id}/uninstall")
async def uninstall(model_id: str):
    return uninstall_model(model_id)