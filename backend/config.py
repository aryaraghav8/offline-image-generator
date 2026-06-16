import os
from dotenv import load_dotenv

load_dotenv()


class Config:

    POLLINATIONS_API_KEY = os.getenv(
        "POLLINATIONS_API_KEY",
        ""
    )

    OUTPUT_DIR = os.getenv(
        "OUTPUT_DIR",
        "outputs"
    )

    DATA_DIR = os.getenv(
        "DATA_DIR",
        "data"
    )

    BASE_URL = os.getenv(
        "BASE_URL",
        "http://localhost:8000"
    )

    DEFAULT_MODEL = os.getenv(
        "IMAGE_MODEL",
        "flux"
    )

    @classmethod
    def init_directories(cls):

        os.makedirs(
            cls.OUTPUT_DIR,
            exist_ok=True
        )

        os.makedirs(
            cls.DATA_DIR,
            exist_ok=True
        )