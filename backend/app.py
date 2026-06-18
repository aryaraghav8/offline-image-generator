from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import Config

# ── User-facing routers ───────────────────────────────────────────────────────
from routes.generate import router as generate_router
from routes.gallery  import router as gallery_router
from routes.models   import router as models_router
from routes.settings import router as settings_router
from routes.health   import router as health_router

# ── Admin routers ─────────────────────────────────────────────────────────────
from routes.admin.dashboard  import router as admin_dashboard_router
from routes.admin.models     import router as admin_models_router
from routes.admin.providers  import router as admin_providers_router
from routes.admin.templates  import router as admin_templates_router
from routes.admin.storage    import router as admin_storage_router
from routes.admin.system     import router as admin_system_router

# ── Initialise data dirs ──────────────────────────────────────────────────────
Config.init_directories()

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Image Generator API",
    version=Config.API_VERSION,
    description="Backend for the Offline Image Generator — user API + admin API.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve generated images as static files
app.mount(
    "/outputs",
    StaticFiles(directory=Config.OUTPUT_DIR),
    name="outputs",
)

# ── Register routers ──────────────────────────────────────────────────────────

# User-facing
app.include_router(health_router)
app.include_router(generate_router)
app.include_router(gallery_router)
app.include_router(models_router)
app.include_router(settings_router)

# Admin
app.include_router(admin_dashboard_router)
app.include_router(admin_models_router)
app.include_router(admin_providers_router)
app.include_router(admin_templates_router)
app.include_router(admin_storage_router)
app.include_router(admin_system_router)
