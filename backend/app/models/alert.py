from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, Boolean, ForeignKey, JSON, Index
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class AlertRule(Base, TimestampMixin):
    __tablename__ = "alert_rules"

    id = Column(String(50), primary_key=True)  # e.g. "rule_failed_logins", "rule_high_downloads"
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    rule_type = Column(String(50), nullable=False)  # failed_logins, mass_deletion, high_downloads, ai_cost_spike, error_spike
    severity = Column(String(20), default="warning", nullable=False)  # info, warning, critical
    
    threshold = Column(Integer, default=5, nullable=False)
    window_seconds = Column(Integer, default=300, nullable=False)  # 5 minutes
    
    is_enabled = Column(Boolean, default=True, nullable=False)
    parameters_json = Column(JSON, default=dict)

    alerts = relationship("Alert", back_populates="rule")


class Alert(Base, TimestampMixin):
    __tablename__ = "alerts"

    id = Column(String(64), primary_key=True)  # UUID
    rule_id = Column(String(50), ForeignKey("alert_rules.id", ondelete="SET NULL"), nullable=True, index=True)
    application_id = Column(String(50), ForeignKey("applications.id", ondelete="CASCADE"), nullable=True, index=True)
    
    severity = Column(String(20), default="warning", nullable=False, index=True)  # info, warning, critical
    title = Column(String(255), nullable=False)
    message = Column(String(1000), nullable=False)
    
    status = Column(String(30), default="open", nullable=False, index=True)  # open, acknowledged, resolved
    deduplication_key = Column(String(255), unique=True, nullable=False, index=True)
    occurrence_count = Column(Integer, default=1, nullable=False)
    
    first_seen_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_seen_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String(255), nullable=True)
    
    metadata_json = Column(JSON, default=dict)

    rule = relationship("AlertRule", back_populates="alerts")


class NotificationDelivery(Base, TimestampMixin):
    __tablename__ = "notification_deliveries"

    id = Column(String(64), primary_key=True)
    alert_id = Column(String(64), ForeignKey("alerts.id", ondelete="CASCADE"), nullable=False, index=True)
    channel = Column(String(50), nullable=False)  # email, webhook, matrix
    recipient = Column(String(255), nullable=False)
    status = Column(String(30), default="pending")  # sent, failed, pending
    delivered_at = Column(DateTime, nullable=True)
    error_message = Column(String(512), nullable=True)
