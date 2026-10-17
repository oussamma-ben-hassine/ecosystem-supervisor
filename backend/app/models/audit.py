from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, JSON, Text
from app.core.database import Base
from app.models.base import TimestampMixin


class AdminAuditLog(Base, TimestampMixin):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    admin_sub = Column(String(255), nullable=False, index=True)
    admin_email = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False, index=True)  # user.view_360, alert.resolve, app.create_key, export.csv
    target_type = Column(String(50), nullable=True)
    target_id = Column(String(255), nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(512), nullable=True)
    details = Column(JSON, default=dict)


class RetentionPolicy(Base, TimestampMixin):
    __tablename__ = "retention_policies"

    id = Column(String(50), primary_key=True)  # e.g. "activity_events_default", "ai_events"
    table_name = Column(String(50), nullable=False)
    retention_days = Column(Integer, default=365, nullable=False)
    is_active = Column(Integer, default=1, nullable=False)
    description = Column(String(255), nullable=True)


class IngestionFailure(Base, TimestampMixin):
    __tablename__ = "ingestion_failures"

    id = Column(Integer, primary_key=True, autoincrement=True)
    application_id = Column(String(50), nullable=True, index=True)
    error_reason = Column(String(255), nullable=False)
    raw_payload = Column(Text, nullable=False)
    retry_count = Column(Integer, default=0, nullable=False)
    status = Column(String(30), default="unresolved", index=True)  # unresolved, discarded, reprocessed
