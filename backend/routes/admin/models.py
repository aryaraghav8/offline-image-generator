from fastapi import APIRouter
from schemas.schemas import AdminModelUpdate, NewModelSource
from services.model_service import (
    admin_get_models,
    admin_update_model,
    admin_set_default_model,
    admin_remove_model,
    admin_add_model_source,
)

router = APIRouter(prefix="/api/admin/models", tags=["admin-models"])


@router.get("")
async def get_models():
    return admin_get_models()


@router.post("")
async def add_model_source(body: NewModelSource):
    return admin_add_model_source(body.model_dump())


@router.patch("/{model_id}")
async def update_model(model_id: str, body: AdminModelUpdate):
    return admin_update_model(model_id, body.model_dump(exclude_none=True))


@router.post("/{model_id}/set-default")
async def set_default(model_id: str):
    return admin_set_default_model(model_id)


@router.delete("/{model_id}")
async def remove_model(model_id: str):
    admin_remove_model(model_id)
    return {"success": True}
