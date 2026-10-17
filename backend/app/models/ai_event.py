from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, Float, ForeignKey, JSON, Index
from app.core.database import Base
from app.models.base import TimestampMixin


class AIUsageEvent(Base, TimestampMixin):
    __tablename__ = "ai_usage_events"

    id = Column(String(64), primary_key=True)  # request_id or UUID
    application_id = Column(String(50), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    user_sub = Column(String(255), nullable=True, index=True)
    user_email = Column(String(255), nullable=True, index=True)
    
    model = Column(String(100), nullable=False, index=True)
    provider = Column(String(50), default="litellm", index=True)
    
    prompt_tokens = Column(Integer, default=0, nullable=False)
    completion_tokens = Column(Integer, default=0, nullable=False)
    total_tokens = Column(Integer, default=0, nullable=False)
    
    estimated_cost = Column(Float, default=0.0, nullable=False)
    duration_ms = Column(Integer, default=0)
    
    status = Column(String(30), default="success", nullable=False, index=True)  # success, error, timeout
    error_message = Column(String(512), nullable=True)
    
    occurred_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    metadata_json = Column(JSON, default=dict)

    __table_args__ = (
        Index("ix_ai_app_model_time", "application_id", "model", "occurred_at"),
        Index("ix_ai_user_time", "user_sub", "occurred_at"),
    )
