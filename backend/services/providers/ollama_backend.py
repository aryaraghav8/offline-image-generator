from __future__ import annotations

import base64
import logging

from openai import OpenAI

from config import Config

logger = logging.getLogger(__name__)

_DEFAULT_BASE = "http://127.0.0.1:11434"


def _client(base_url: str) -> OpenAI:
    """Ollama exposes an OpenAI-compatible API — no API key needed."""
    url = (base_url or "").rstrip("/") or Config.OLLAMA_BASE_URL or _DEFAULT_BASE
    # Ollama requires the path to end with /v1
    if not url.endswith("/v1"):
        url = url.rstrip("/") + "/v1"
    return OpenAI(api_key="ollama", base_url=url)


def generate(
    *,
    model_id: str,
    prompt: str,
    width: int,
    height: int,
    seed: int | None = None,
    base_url: str = "",
    **_kwargs,
) -> bytes:
    """Call a locally running Ollama image model and return raw PNG bytes.

    Requires Ollama >= 0.5 with an image-generation model pulled, e.g.:
        ollama pull hf.co/black-forest-labs/FLUX.1-dev
        ollama pull hf.co/stabilityai/stable-diffusion-3.5-medium

    Ollama exposes OpenAI-compatible /v1/images/generations, so we reuse
    the same openai client pattern — no extra library needed.
    """
    client = _client(base_url)

    kwargs: dict = {}
    if seed is not None:
        # Ollama passes extra options through the 'extra_body' mechanism
        kwargs["extra_body"] = {"options": {"seed": seed}}

    result = client.images.generate(
        model=model_id,
        prompt=prompt,
        size=f"{width}x{height}",
        n=1,
        response_format="b64_json",
        **kwargs,
    )

    b64 = result.data[0].b64_json
    if not b64:
        raise ValueError("Ollama returned an empty image response")

    return base64.b64decode(b64)
