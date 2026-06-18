import json
from pathlib import Path
from fastapi import HTTPException

MODELS_FILE = Path("data/models.json")


def load_models():
    
    print("Current directory:", Path.cwd())
    print("Models file:", MODELS_FILE.resolve())
    print("Exists:", MODELS_FILE.exists())
    if not MODELS_FILE.exists():
        return []

    with open(
        MODELS_FILE,
        "r",
        encoding="utf-8"
    ) as f:
        return json.load(f)


def save_models(models):
    MODELS_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with open(
        MODELS_FILE,
        "w",
        encoding="utf-8"
    ) as f:
        json.dump(
            models,
            f,
            indent=2
        )


def get_models():
    return load_models()


def get_model(model_id: str):
    models = load_models()

    model = next(
        (
            m
            for m in models
            if m["id"] == model_id
        ),
        None
    )

    if not model:
        raise HTTPException(
            status_code=404,
            detail="Model not found"
        )

    return model


def install_model(model_id: str):
    models = load_models()

    model = next(
        (
            m
            for m in models
            if m["id"] == model_id
        ),
        None
    )

    if not model:
        raise HTTPException(
            status_code=404,
            detail="Model not found"
        )

    model["installed"] = True

    save_models(models)

    return {
        "success": True,
        "message": f"{model_id} installed"
    }


def uninstall_model(model_id: str):
    models = load_models()

    model = next(
        (
            m
            for m in models
            if m["id"] == model_id
        ),
        None
    )

    if not model:
        raise HTTPException(
            status_code=404,
            detail="Model not found"
        )

    model["installed"] = False

    save_models(models)

    return {
        "success": True,
        "message": f"{model_id} uninstalled"
    }