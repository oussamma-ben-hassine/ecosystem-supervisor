from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class Application(Base, TimestampMixin):
    __tablename__ = "applications"

    id = Column(String(50), primary_key=True)  # unique slug/code, e.g. "drive", "messenger"
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    fqdn = Column(String(255), nullable=True)
    icon = Column(String(50), default="AppWindow")
    is_active = Column(Boolean, default=True, nullable=False)
    integration_status = Column(String(30), default="active")  # active, partial, pending
    version = Column(String(20), default="1.0.0")

    credentials = relationship("AppCredential", back_populates="application", cascade="all, delete-orphan")


class AppCredential(Base, TimestampMixin):
    __tablename__ = "app_credentials"

    id = Column(Integer, primary_key=True, autoincrement=True)
    application_id = Column(String(50), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    key_prefix = Column(String(20), nullable=False)  # e.g. "es_drive_xxxx"
    key_hash = Column(String(64), unique=True, nullable=False, index=True)  # sha256 hash
    description = Column(String(100), default="Default ingestion key")
    is_active = Column(Boolean, default=True, nullable=False)
    scopes = Column(JSON, default=list)  # ["events:write", "ai:report"]
    last_used_at = Column(DateTime, nullable=True)

    application = relationship("Application", back_populates="credentials")
