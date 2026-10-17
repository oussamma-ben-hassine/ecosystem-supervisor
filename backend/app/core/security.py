import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status, Depends
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.database import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_api_key(api_key: str) -> str:
    """Hash API key with SHA-256 for secure database lookup."""
    return hashlib.sha256(api_key.encode("utf-8")).hexdigest()


def generate_api_key(app_code: str) -> str:
    """Generate a high-entropy cryptographically secure API key."""
    random_part = secrets.token_urlsafe(32)
    return f"es_{app_code}_{random_part}"


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None


async def get_current_app_by_api_key(
    x_supervisor_key: Optional[str] = Header(None, alias="X-Supervisor-Key"),
    authorization: Optional[str] = Header(None, alias="Authorization"),
    db: AsyncSession = Depends(get_db),
):
    """Authenticate incoming server-to-server application ingestion requests via API key."""
    api_key = x_supervisor_key
    if not api_key and authorization:
        if authorization.startswith("Bearer es_"):
            api_key = authorization.replace("Bearer ", "").strip()
        elif authorization.startswith("ApiKey "):
            api_key = authorization.replace("ApiKey ", "").strip()

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing application ingestion API key. Provide X-Supervisor-Key header.",
        )

    key_hash = hash_api_key(api_key)
    
    # Import locally to prevent circular imports
    from app.models.application import AppCredential, Application

    query = (
        select(AppCredential, Application)
        .join(Application, AppCredential.application_id == Application.id)
        .where(
            AppCredential.key_hash == key_hash,
            AppCredential.is_active == True,
            Application.is_active == True,
        )
    )
    result = await db.execute(query)
    record = result.first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or revoked application credentials.",
        )

    cred, app = record
    cred.last_used_at = datetime.utcnow()
    await db.commit()

    return {
        "app_id": app.id,
        "app_code": app.code,
        "app_name": app.name,
        "scopes": cred.scopes or ["events:write"],
    }


async def get_current_user_optional(
    authorization: Optional[str] = Header(None, alias="Authorization"),
) -> Optional[Dict[str, Any]]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    return payload


async def get_current_admin_user(
    authorization: Optional[str] = Header(None, alias="Authorization"),
) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required.",
        )
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token.",
        )
    
    # Check if admin
    email = payload.get("email")
    role = payload.get("role", "user")
    if role != "admin" and email not in settings.ADMIN_EMAILS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required to access this resource.",
        )
    return payload
