from fastapi import APIRouter
from schemas.schemas import RestartRequest
from services.system_service import get_system_overview, restart_service

router = APIRouter(prefix="/api/admin/system", tags=["admin-system"])


@router.get("")
async def system():
    return get_system_overview()


@router.post("/restart")
async def restart(body: RestartRequest):
    return restart_service(body.serviceId)
