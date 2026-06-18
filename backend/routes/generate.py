from models.generate_schema import GenerateRequest
from services.generation_service import (generate_image)


async def generate(
    data: GenerateRequest
):
    print("generate route")

    return generate_image(
        data
    )