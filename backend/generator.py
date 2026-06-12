import os
from datetime import datetime

from config import (
    WIDTH,
    HEIGHT,
    NUM_INFERENCE_STEPS,
    GUIDANCE_SCALE,
    OUTPUT_DIR
)

from src.model_loader import load_model

# Load model once
pipe = load_model()


def generate_image(prompt):
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    image = pipe(
        prompt=prompt,
        width=WIDTH,
        height=HEIGHT,
        num_inference_steps=NUM_INFERENCE_STEPS,
        guidance_scale=GUIDANCE_SCALE
    ).images[0]

    filename = f"image_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"

    output_path = os.path.join(OUTPUT_DIR, filename)

    image.save(output_path)

    return output_path