from datetime import datetime, date
from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class TimeSeriesPoint(BaseModel):
    date: str
    count: int
    category: Optional[str] = None


class ApplicationUsageStats(BaseModel):
    application_id: str
    name: str
    event_count: int
    user_count: int
    percentage: float
    status: str


class AIModelUsage(BaseModel):
    model: str
    requests: int
    tokens: int
    cost: float


class AIUsageStats(BaseModel):
    total_requests: int
    total_tokens: int
    prompt_tokens: int
    completion_tokens: int
    estimated_cost_usd: float
    error_count: int
    models: List[AIModelUsage]
    applications: List[Dict[str, Any]]
    timeline: List[Dict[str, Any]]


class AnalyticsOverview(BaseModel):
    total_users: int
    dau: int
    wau: int
    mau: int
    total_events_today: int
    total_events_all_time: int
    active_alerts_count: int
    successful_logins_24h: int
    failed_logins_24h: int
    ai_tokens_today: int
    ai_cost_today_usd: float
    top_applications: List[ApplicationUsageStats]
    activity_trend_7d: List[TimeSeriesPoint]
