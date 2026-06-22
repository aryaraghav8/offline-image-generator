from __future__ import annotations

import base64
import logging
import os

from openai import OpenAI

from config import Config

logger = logging.getLogger(__name__)


def _client() -> OpenAI:
    return OpenAI(
        api_key=os.environ.get("POLLINATIONS_API_KEY") or Config.POLLINATIONS_API_KEY or "dummy",
        base_url=Config.POLLINATIONS_BASE_URL,
    )


def generate(
    *,
    model_id: str,
    prompt: str,
    width: int,
    height: int,
    seed: int | None = None,
    **_kwargs,
) -> bytes:
    """Call Pollinations and return raw PNG bytes."""
    extra: dict = {}
    if seed is not None:
        extra["seed"] = seed

    result = _client().images.generate(
        model=model_id,
        prompt=prompt,
        size=f"{width}x{height}",
        n=1,
        **extra,
    )
    return base64.b64decode(result.data[0].b64_json)