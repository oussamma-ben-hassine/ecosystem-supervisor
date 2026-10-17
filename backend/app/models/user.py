from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(String(100), primary_key=True)  # stable identifier hash or uuid
    issuer = Column(String(255), nullable=False, index=True)
    sub = Column(String(255), nullable=False, index=True)
    email = Column(String(255), nullable=True, index=True)
    name = Column(String(255), nullable=True)
    avatar_url = Column(String(512), nullable=True)
    role = Column(String(50), default="user", nullable=False)  # admin, user, auditor
    is_active = Column(Boolean, default=True, nullable=False)
    last_active_at = Column(DateTime, nullable=True, index=True)
    metadata_json = Column(JSON, default=dict)

    # Unique constraint on issuer + sub
    __table_args__ = (
        UniqueConstraint("issuer", "sub", name="uq_user_issuer_sub"),
    )

    app_accesses = relationship("UserAppAccess", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")


class UserAppAccess(Base, TimestampMixin):
    __tablename__ = "user_app_access"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(100), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    application_id = Column(String(50), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    granted = Column(Boolean, default=True, nullable=False)
    role = Column(String(50), default="member")
    first_access_at = Column(DateTime, default=datetime.utcnow)
    last_access_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="app_accesses")
    application = relationship("Application")

    __table_args__ = (
        UniqueConstraint("user_id", "application_id", name="uq_user_app_access"),
    )


class UserSession(Base, TimestampMixin):
    __tablename__ = "user_sessions"

    id = Column(String(100), primary_key=True)  # session_id or token jti
    user_id = Column(String(100), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    application_id = Column(String(50), ForeignKey("applications.id", ondelete="CASCADE"), nullable=True, index=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(512), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    terminated_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="sessions")
    application = relationship("Application")
