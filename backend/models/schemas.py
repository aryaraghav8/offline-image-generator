from __future__ import annotations
from typing import Any, Literal, Optional
from pydantic import BaseModel


# ─── Generation ───────────────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    prompt: str
    negativePrompt: Optional[str] = None
    model: str = "flux"
    width:    int   = 1024
    height:   int   = 1024
    steps:    int   = 30
    cfgScale: float = 7.0
    seed:     Optional[int] = None
    randomSeed: bool = True
    count:    int   = 1


# ─── Admin: Templates ─────────────────────────────────────────────────────────

class ModelRequest(BaseModel):
    id: str
    displayName: str
    description: str
    category: str
    performance: str
    size: str
    vram: int
    quality: int
    source: str = "api"
    provider: Optional[str] = None
    alias: Optional[str] = None
    path: Optional[str] = None
    enabled: bool = True
    installed: bool = False
    lastUsed: Optional[str] = None
# ─── Admin: Models ────────────────────────────────────────────────────────────

class AdminModelUpdate(BaseModel):
    status:         Optional[Literal["active", "installing", "disabled", "error", "not-installed"]] = None
    visibleToUsers: Optional[bool] = None
    isDefault:      Optional[bool] = None


# ─── Admin: Providers ─────────────────────────────────────────────────────────

class ProviderKeyUpdate(BaseModel):
    apiKey: str


# ─── Admin: Templates ─────────────────────────────────────────────────────────

class TemplatePayload(BaseModel):
    id:          Optional[str] = None
    name:        str
    category:    str
    description: str
    content:     str
    published:   bool = False
    author:      str  = "Admin"



class TemplatePublishUpdate(BaseModel):
    published: bool


# ─── Admin: Storage ───────────────────────────────────────────────────────────

class RetentionPolicyUpdate(BaseModel):
    retentionDays:      int
    autoCleanupEnabled: bool


# ─── Admin: System ────────────────────────────────────────────────────────────

class RestartRequest(BaseModel):
    serviceId: str
