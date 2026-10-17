from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, JSON, Index
from app.core.database import Base
from app.models.base import TimestampMixin


class ActivityEvent(Base, TimestampMixin):
    __tablename__ = "activity_events"

    event_id = Column(String(64), primary_key=True)  # UUID or unique event id
    event_type = Column(String(100), nullable=False, index=True)
    event_version = Column(Integer, default=1, nullable=False)
    application_id = Column(String(50), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Actor (SSO)
    actor_issuer = Column(String(255), nullable=True, index=True)
    actor_sub = Column(String(255), nullable=True, index=True)
    actor_email = Column(String(255), nullable=True, index=True)
    actor_name = Column(String(255), nullable=True)

    occurred_at = Column(DateTime, nullable=False, index=True)
    ingested_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Resource affected
    resource_type = Column(String(100), nullable=True, index=True)
    resource_id = Column(String(255), nullable=True, index=True)
    
    outcome = Column(String(30), default="success", nullable=False, index=True)  # success, failure, denied
    correlation_id = Column(String(64), nullable=True, index=True)
    client_ip = Column(String(45), nullable=True)
    user_agent = Column(String(512), nullable=True)
    
    metadata_json = Column(JSON, default=dict)

    __table_args__ = (
        Index("ix_activity_actor_time", "actor_issuer", "actor_sub", "occurred_at"),
        Index("ix_activity_app_time", "application_id", "occurred_at"),
    )


class AuthEvent(Base, TimestampMixin):
    __tablename__ = "auth_events"

    id = Column(String(64), primary_key=True)
    event_type = Column(String(50), nullable=False, index=True)  # login_success, login_failure, logout
    application_id = Column(String(50), nullable=False, index=True)
    issuer = Column(String(255), nullable=False)
    sub = Column(String(255), nullable=True, index=True)
    email = Column(String(255), nullable=True, index=True)
    client_ip = Column(String(45), nullable=True)
    user_agent = Column(String(512), nullable=True)
    occurred_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    outcome = Column(String(20), nullable=False)  # success, failure
    failure_reason = Column(String(255), nullable=True)
    metadata_json = Column(JSON, default=dict)
