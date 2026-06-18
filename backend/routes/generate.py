from fastapi import APIRouter
from models.schemas import GenerateRequest
from services.generation_service import generate_image

router = APIRouter(tags=["generation"])


@router.post("/api/generate")
async def generate(data: GenerateRequest):
    return generate_image(data)
