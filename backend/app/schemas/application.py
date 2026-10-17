from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class ApplicationBase(BaseModel):
    id: str = Field(..., description="Application slug identifier, e.g. drive")
    name: str = Field(..., description="Display name")
    description: Optional[str] = None
    fqdn: Optional[str] = None
    icon: Optional[str] = "AppWindow"
    is_active: bool = True
    integration_status: str = "active"


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationResponse(ApplicationBase):
    created_at: datetime
    updated_at: datetime
    events_count: Optional[int] = 0
    active_users_count: Optional[int] = 0

    class Config:
        from_attributes = True


class AppCredentialCreate(BaseModel):
    description: Optional[str] = "Ingestion API Key"
    scopes: Optional[List[str]] = ["events:write", "ai:report"]


class AppCredentialResponse(BaseModel):
    id: int
    application_id: str
    key_prefix: str
    description: Optional[str]
    is_active: bool
    scopes: List[str]
    last_used_at: Optional[datetime]
    created_at: datetime
    raw_api_key: Optional[str] = None  # Only returned once upon creation

    class Config:
        from_attributes = True
