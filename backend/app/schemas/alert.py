from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class AlertRuleResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    rule_type: str
    severity: str
    threshold: int
    window_seconds: int
    is_enabled: bool

    class Config:
        from_attributes = True


class AlertResponse(BaseModel):
    id: str
    rule_id: Optional[str]
    application_id: Optional[str]
    severity: str
    title: str
    message: str
    status: str
    occurrence_count: int
    first_seen_at: datetime
    last_seen_at: datetime
    resolved_at: Optional[datetime]
    resolved_by: Optional[str]
    metadata: Dict[str, Any] = {}

    class Config:
        from_attributes = True


class AlertResolveRequest(BaseModel):
    note: Optional[str] = None
