from fastapi import APIRouter
from services.dashboard_service import get_dashboard

router = APIRouter(prefix="/api/admin", tags=["admin-dashboard"])


@router.get("/dashboard")
async def dashboard():
    return get_dashboard()
