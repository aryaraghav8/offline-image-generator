from __future__ import annotations

import base64
import logging
import os

from openai import OpenAI

logger = logging.getLogger(__name__)

# Supported DALL-E sizes
_VALID_SIZES = {
    "dall-e-2": ["256x256", "512x512", "1024x1024"],
    "dall-e-3": ["1024x1024", "1792x1024", "1024x1792"],
}


def _nearest_size(model_id: str, width: int, height: int) -> str:
    sizes = _VALID_SIZES.get(model_id, ["1024x1024"])
    requested = f"{width}x{height}"
    if requested in sizes:
        return requested
    # Fall back to first (smallest / safest) supported size
    logger.warning(
        "OpenAI model %s does not support %s — using %s instead",
        model_id, requested, sizes[0],
    )
    return sizes[0]


def generate(
    *,
    model_id: str,
    prompt: str,
    width: int,
    height: int,
    **_kwargs,
) -> bytes:
    """Call OpenAI Images API and return raw PNG bytes."""
    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        raise ValueError(
            "OPENAI_API_KEY is not set. Add it via Admin › Providers or set it in .env"
        )

    client = OpenAI(api_key=api_key)
    size = _nearest_size(model_id, width, height)

    result = client.images.generate(
        model=model_id,
        prompt=prompt,
        size=size,
        n=1,
        response_format="b64_json",
    )
    return base64.b64decode(result.data[0].b64_json)