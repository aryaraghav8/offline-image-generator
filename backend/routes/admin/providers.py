from fastapi import APIRouter
from schemas.schemas import ProviderKeyUpdate
from services.provider_service import (
    get_providers,
    test_provider,
    set_api_key,
)

router = APIRouter(prefix="/api/admin/providers", tags=["admin-providers"])


@router.get("")
async def providers():
    return get_providers()


@router.post("/{provider_id}/test")
async def test(provider_id: str):
    return await test_provider(provider_id)


@router.put("/{provider_id}/api-key")
async def api_key(provider_id: str, body: ProviderKeyUpdate):
    return set_api_key(provider_id, body.apiKey)
