from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class ActorSchema(BaseModel):
    issuer: str = Field(..., description="SSO Issuer identifier, e.g. https://sso-a.oussamma.tn")
    sub: str = Field(..., description="Stable user subject identifier")
    email: Optional[str] = Field(None, description="User email if available")
    name: Optional[str] = Field(None, description="User display name")


class ResourceRefSchema(BaseModel):
    type: str = Field(..., description="Resource type, e.g. file, cv, note, conversation")
    id: str = Field(..., description="Unique resource identifier in the source application")
    name: Optional[str] = Field(None, description="Name or title of the resource")
    mime_type: Optional[str] = Field(None, description="MIME type if applicable")
    size_bytes: Optional[int] = Field(None, description="Size in bytes if applicable")


class EventIngestSchema(BaseModel):
    event_id: str = Field(..., description="UUID or unique identifier for idempotency")
    event_type: str = Field(..., description="Namespaced event type, e.g. file.downloaded, user.login")
    event_version: int = Field(1, description="Event schema version")
    application: Optional[str] = Field(None, description="Declared source application (validated against API key)")
    actor: Optional[ActorSchema] = Field(None, description="Actor performing the action")
    occurred_at: datetime = Field(default_factory=datetime.utcnow, description="Timestamp when the event occurred (ISO 8601)")
    resource: Optional[ResourceRefSchema] = Field(None, description="Target resource if applicable")
    outcome: str = Field("success", description="Outcome: success, failure, denied")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Safe metadata (NO passwords, NO raw message/prompt texts)")
    correlation_id: Optional[str] = Field(None, description="Correlation or trace ID")


class EventBatchIngestSchema(BaseModel):
    events: List[EventIngestSchema] = Field(..., max_length=500, description="Batch of up to 500 events")


class EventBatchResponseSchema(BaseModel):
    status: str = "success"
    processed: int
    failed: int = 0
    errors: Optional[List[str]] = None
    ingested_at: datetime = Field(default_factory=datetime.utcnow)
