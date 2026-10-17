from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, JSON, Index, BigInteger
from app.core.database import Base
from app.models.base import TimestampMixin


class Resource(Base, TimestampMixin):
    __tablename__ = "resources"

    id = Column(String(255), primary_key=True)  # resource_type:resource_id
    resource_type = Column(String(100), nullable=False, index=True)
    external_id = Column(String(255), nullable=False, index=True)
    application_id = Column(String(50), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    owner_sub = Column(String(255), nullable=True, index=True)
    name = Column(String(255), nullable=True)
    mime_type = Column(String(100), nullable=True)
    size_bytes = Column(BigInteger, default=0)
    is_deleted = Column(Integer, default=0, nullable=False)  # 0=no, 1=yes
    last_action_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    metadata_json = Column(JSON, default=dict)


class DataEvent(Base, TimestampMixin):
    __tablename__ = "data_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(String(64), nullable=False, index=True)
    operation = Column(String(50), nullable=False, index=True)  # create, update, delete, download, share, export, permission_change
    application_id = Column(String(50), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    resource_id = Column(String(255), ForeignKey("resources.id", ondelete="CASCADE"), nullable=False, index=True)
    actor_sub = Column(String(255), nullable=True, index=True)
    bytes_transferred = Column(BigInteger, default=0)
    target_user_sub = Column(String(255), nullable=True)  # For share operations
    occurred_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    metadata_json = Column(JSON, default=dict)

    __table_args__ = (
        Index("ix_data_app_op_time", "application_id", "operation", "occurred_at"),
    )
