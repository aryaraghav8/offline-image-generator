import os
import json
import uuid
import base64
import logging

from datetime import datetime
from models.schemas import (GenerateRequest)
from openai import OpenAI
from config import Config

logger = logging.getLogger(__name__)


# Pollinations Client
client = OpenAI(
    api_key=os.getenv("POLLINATIONS_API_KEY"),
    base_url="https://gen.pollinations.ai/v1"
)

def generate_image(data: GenerateRequest):
    print("generate main")

    try:

        start_time = datetime.now()

        result = client.images.generate(
            model=data.model,
            prompt=data.prompt
        )

        image_bytes = base64.b64decode(
            result.data[0].b64_json
        )

        image_id = str(
            uuid.uuid4()
        )

        filename = f"{image_id}.png"

        output_path = os.path.join(
            Config.OUTPUT_DIR,
            filename
        )

        with open(
            output_path,
            "wb"
        ) as f:
            f.write(image_bytes)

        generation_time = (
            datetime.now() - start_time
        ).total_seconds()

        metadata_file = os.path.join(
            Config.DATA_DIR,
            "images.json"
        )

        images = []

        if os.path.exists(metadata_file):

            try:

                with open(
                    metadata_file,
                    "r",
                    encoding="utf-8"
                ) as f:

                    images = json.load(f)

            except Exception:

                images = []

        image_url = (
            f"{Config.BASE_URL}/outputs/{filename}"
        )

        image_data = {

            "id": image_id,
            "url": image_url,
            "prompt": data.prompt,
            "negativePrompt": data.negativePrompt,
            "model": data.model,
            "params": {
                "width": data.width,
                "height": data.height,
                "steps": data.steps,
                "cfgScale": data.cfgScale,
                "count": data.count
            },

            "createdAt": datetime.now().isoformat(),
            "generationTime": generation_time,
            "isFavorite": False
        }

        images.insert(
            0,
            image_data
        )

        with open(
            metadata_file,
            "w",
            encoding="utf-8"
        ) as f:

            json.dump(
                images,
                f,
                indent=2
            )

        return {

            "success": True,
            "imageUrl": image_url,
            "image": image_data
        }

    except Exception as e:

        logger.exception(
            "Generation Failed"
        )

        return {

            "success": False,
            "error": str(e)
        }


def get_gallery():

    metadata_file = os.path.join(
        Config.DATA_DIR,
        "images.json"
    )

    if not os.path.exists(
        metadata_file
    ):
        return []

    try:

        with open(
            metadata_file,
            "r",
            encoding="utf-8"
        ) as f:

            return json.load(f)

    except Exception:

        return []