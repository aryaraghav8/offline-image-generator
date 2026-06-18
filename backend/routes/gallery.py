from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from services.generation_service import (
    get_gallery,
    get_image,
    delete_image,
    toggle_favorite,
    get_favorites,
    get_image_path,
)

router = APIRouter(tags=["gallery"])


@router.get("/api/images")
async def images():
    return get_gallery()


@router.get("/api/images/{image_id}")
async def image_detail(image_id: str):
    img = get_image(image_id)
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    return img


@router.delete("/api/images/{image_id}")
async def remove_image(image_id: str):
    if not delete_image(image_id):
        raise HTTPException(status_code=404, detail="Image not found")
    return {"success": True}


@router.post("/api/images/{image_id}/favorite")
async def favorite(image_id: str):
    img = toggle_favorite(image_id)
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    return img


@router.get("/api/favorites")
async def favorites():
    return get_favorites()


@router.get("/api/images/{image_id}/download")
async def download(image_id: str):
    path = get_image_path(image_id)
    if not path:
        raise HTTPException(status_code=404, detail="Image file not found")
    return FileResponse(
        path,
        media_type="image/png",
        filename=f"{image_id}.png",
    )
