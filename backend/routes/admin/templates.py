from fastapi import APIRouter
from models.schemas import TemplatePayload, TemplatePublishUpdate
from services.template_service import (
    get_templates,
    upsert_template,
    set_published,
    delete_template,
)

router = APIRouter(prefix="/api/admin/templates", tags=["admin-templates"])


@router.get("")
async def templates():
    return get_templates()


@router.post("")
async def create(body: TemplatePayload):
    return upsert_template(body.model_dump())


@router.put("/{tpl_id}")
async def update(tpl_id: str, body: TemplatePayload):
    payload = body.model_dump()
    payload["id"] = tpl_id
    return upsert_template(payload)


@router.patch("/{tpl_id}/publish")
async def publish(tpl_id: str, body: TemplatePublishUpdate):
    return set_published(tpl_id, body.published)


@router.delete("/{tpl_id}")
async def remove(tpl_id: str):
    delete_template(tpl_id)
    return {"success": True}
