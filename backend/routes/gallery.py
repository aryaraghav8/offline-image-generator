from fastapi import APIRouter
from services.generation_service import (get_gallery)

router = APIRouter()


@router.get(
    "/api/images"
)
async def images():

    return get_gallery()