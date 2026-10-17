from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class UserSummary(BaseModel):
    id: str
    issuer: str
    sub: str
    email: Optional[str]
    name: Optional[str]
    avatar_url: Optional[str]
    role: str
    is_active: bool
    last_active_at: Optional[datetime]
    created_at: datetime
    accessible_apps: List[str] = []
    total_events: int = 0

    class Config:
        from_attributes = True


class UserActivityTimelineItem(BaseModel):
    event_id: str
    event_type: str
    application_id: str
    application_name: Optional[str]
    occurred_at: datetime
    outcome: str
    resource_type: Optional[str]
    resource_id: Optional[str]
    resource_name: Optional[str]
    metadata: Dict[str, Any] = {}
    correlation_id: Optional[str]

    class Config:
        from_attributes = True


class UserActivityResponse(BaseModel):
    user: UserSummary
    timeline: List[UserActivityTimelineItem]
    total_events: int
    page: int
    page_size: int
    covered_apps: List[str]
    unintegrated_apps: List[str]
    date_range: Dict[str, Optional[datetime]]
