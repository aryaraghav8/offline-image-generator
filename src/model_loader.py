import torch
from diffusers import StableDiffusionPipeline
from config import MODEL_PATH


def load_model():
    print("Loading model...")

    pipe = StableDiffusionPipeline.from_single_file(
        MODEL_PATH,
        torch_dtype=torch.float32
    )

    pipe = pipe.to("cpu")

    print("Model loaded successfully!")

    return pipe