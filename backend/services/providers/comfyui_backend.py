from __future__ import annotations

import io
import json
import logging
import time
import uuid

import httpx

from config import Config

logger = logging.getLogger(__name__)

# Default ComfyUI base URL (overridden per-model via baseUrl field)
_DEFAULT_BASE = "http://127.0.0.1:8188"


def _base_url(model_base_url: str) -> str:
    return (model_base_url or "").rstrip("/") or _DEFAULT_BASE


def generate(
    *,
    model_id: str,
    prompt: str,
    width: int,
    height: int,
    steps: int = 20,
    cfg_scale: float = 7.0,
    seed: int | None = None,
    base_url: str = "",
    **_kwargs,
) -> bytes:
    """Submit a prompt to ComfyUI and return raw PNG bytes.

    Uses the minimal text-to-image workflow bundled below.
    Polls /history until the job is done then downloads the first output image.
    """
    base = _base_url(base_url)
    client_id = str(uuid.uuid4())

    workflow = _build_workflow(
        model_id=model_id,
        prompt=prompt,
        width=width,
        height=height,
        steps=steps,
        cfg_scale=cfg_scale,
        seed=seed if seed is not None else int(time.time()) % 2**31,
    )

    with httpx.Client(base_url=base, timeout=300.0) as client:
        # Queue prompt
        resp = client.post(
            "/prompt",
            json={"client_id": client_id, "prompt": workflow},
        )
        resp.raise_for_status()
        prompt_id = resp.json()["prompt_id"]

        # Poll history (max 5 min)
        for _ in range(600):
            time.sleep(0.5)
            hist = client.get(f"/history/{prompt_id}").json()
            if prompt_id in hist:
                outputs = hist[prompt_id].get("outputs", {})
                for node_out in outputs.values():
                    images = node_out.get("images", [])
                    if images:
                        img = images[0]
                        img_resp = client.get(
                            "/view",
                            params={
                                "filename": img["filename"],
                                "subfolder": img.get("subfolder", ""),
                                "type": img.get("type", "output"),
                            },
                        )
                        img_resp.raise_for_status()
                        return img_resp.content

        raise TimeoutError("ComfyUI job did not complete within 5 minutes")


def _build_workflow(
    *,
    model_id: str,
    prompt: str,
    width: int,
    height: int,
    steps: int,
    cfg_scale: float,
    seed: int,
) -> dict:
    """Minimal KSampler workflow that works with any SDXL / SD1.5 checkpoint."""
    return {
        "1": {
            "class_type": "CheckpointLoaderSimple",
            "inputs": {"ckpt_name": model_id},
        },
        "2": {
            "class_type": "CLIPTextEncode",
            "inputs": {"text": prompt, "clip": ["1", 1]},
        },
        "3": {
            "class_type": "CLIPTextEncode",
            "inputs": {"text": "", "clip": ["1", 1]},
        },
        "4": {
            "class_type": "EmptyLatentImage",
            "inputs": {"width": width, "height": height, "batch_size": 1},
        },
        "5": {
            "class_type": "KSampler",
            "inputs": {
                "model": ["1", 0],
                "positive": ["2", 0],
                "negative": ["3", 0],
                "latent_image": ["4", 0],
                "seed": seed,
                "steps": steps,
                "cfg": cfg_scale,
                "sampler_name": "euler",
                "scheduler": "normal",
                "denoise": 1.0,
            },
        },
        "6": {
            "class_type": "VAEDecode",
            "inputs": {"samples": ["5", 0], "vae": ["1", 2]},
        },
        "7": {
            "class_type": "SaveImage",
            "inputs": {"images": ["6", 0], "filename_prefix": "output"},
        },
    }