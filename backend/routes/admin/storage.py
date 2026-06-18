from fastapi import APIRouter
from schemas.schemas import RetentionPolicyUpdate
from services.storage_service import (
    get_storage_overview,
    update_retention_policy,
    run_cleanup,
)

router = APIRouter(prefix="/api/admin/storage", tags=["admin-storage"])


@router.get("")
async def storage():
    return get_storage_overview()


@router.put("/policy")
async def policy(body: RetentionPolicyUpdate):
    return update_retention_policy(body.retentionDays, body.autoCleanupEnabled)


@router.post("/cleanup")
async def cleanup():
    return run_cleanup()
