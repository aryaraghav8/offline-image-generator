from __future__ import annotations

import logging
import os

import httpx

logger = logging.getLogger(__name__)

_HF_INFERENCE_BASE = "https://api-inference.huggingface.co"


def generate(
    *,
    model_id: str,
    prompt: str,
    width: int,
    height: int,
    steps: int = 20,
    cfg_scale: float = 7.0,
    seed: int | None = None,
    hf_repo: str = "",
    **_kwargs,
) -> bytes:
    """Call Hugging Face Inference API and return raw PNG bytes.

    model_id is the HF repo string, e.g. 'stabilityai/stable-diffusion-xl-base-1.0'.
    hf_repo takes precedence over model_id when set.
    """
    api_key = os.environ.get("HF_API_KEY", "")
    if not api_key:
        raise ValueError(
            "HF_API_KEY is not set. Add it via Admin › Providers or set it in .env"
        )

    repo = (hf_repo or model_id).strip()
    if not repo:
        raise ValueError("No Hugging Face model repo specified")

    url = f"{_HF_INFERENCE_BASE}/models/{repo}"

    payload: dict = {
        "inputs": prompt,
        "parameters": {
            "width": width,
            "height": height,
            "num_inference_steps": steps,
            "guidance_scale": cfg_scale,
        },
    }
    if seed is not None:
        payload["parameters"]["seed"] = seed

    headers = {"Authorization": f"Bearer {api_key}"}

    with httpx.Client(timeout=120.0) as client:
        resp = client.post(url, json=payload, headers=headers)
        resp.raise_for_status()
        return resp.content  # HF returns raw image bytes