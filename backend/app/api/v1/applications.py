import logging
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import generate_api_key, hash_api_key, get_current_admin_user
from app.models.application import Application, AppCredential
from app.models.event import ActivityEvent
from app.models.user import UserAppAccess
from app.schemas.application import (
    ApplicationResponse,
    ApplicationCreate,
    AppCredentialCreate,
    AppCredentialResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.get("", response_model=List[ApplicationResponse])
async def list_applications(db: AsyncSession = Depends(get_db)):
    """List all registered ecosystem applications with statistics."""
    stmt = select(Application).order_by(Application.name)
    result = await db.execute(stmt)
    apps = result.scalars().all()

    response = []
    for app in apps:
        # Count total events
        ev_count = await db.scalar(
            select(func.count()).select_from(ActivityEvent).where(ActivityEvent.application_id == app.id)
        )
        # Count active users
        user_count = await db.scalar(
            select(func.count()).select_from(UserAppAccess).where(UserAppAccess.application_id == app.id)
        )

        app_dict = {
            "id": app.id,
            "code": app.code,
            "name": app.name,
            "description": app.description,
            "fqdn": app.fqdn,
            "icon": app.icon,
            "is_active": app.is_active,
            "integration_status": app.integration_status,
            "created_at": app.created_at,
            "updated_at": app.updated_at,
            "events_count": ev_count or 0,
            "active_users_count": user_count or 0,
        }
        response.append(ApplicationResponse(**app_dict))

    return response


@router.post("", response_model=ApplicationResponse)
async def create_application(
    payload: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
    admin: Dict[str, Any] = Depends(get_current_admin_user),
):
    """Register a new application in the supervisor."""
    existing = await db.scalar(select(Application).where(Application.id == payload.id))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Application '{payload.id}' already exists.",
        )

    new_app = Application(
        id=payload.id,
        code=payload.id,
        name=payload.name,
        description=payload.description,
        fqdn=payload.fqdn,
        icon=payload.icon or "AppWindow",
        is_active=payload.is_active,
        integration_status=payload.integration_status,
    )
    db.add(new_app)
    await db.commit()
    await db.refresh(new_app)
    return new_app


@router.post("/{app_id}/credentials", response_model=AppCredentialResponse)
async def create_app_credential(
    app_id: str,
    payload: AppCredentialCreate,
    db: AsyncSession = Depends(get_db),
    admin: Dict[str, Any] = Depends(get_current_admin_user),
):
    """Generate a new ingestion API key for an application."""
    app = await db.scalar(select(Application).where(Application.id == app_id))
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    raw_key = generate_api_key(app.code)
    key_hash = hash_api_key(raw_key)

    credential = AppCredential(
        application_id=app_id,
        key_prefix=raw_key[:12],
        key_hash=key_hash,
        description=payload.description,
        is_active=True,
        scopes=payload.scopes or ["events:write"],
    )
    db.add(credential)
    await db.commit()
    await db.refresh(credential)

    res = AppCredentialResponse.from_orm(credential)
    res.raw_api_key = raw_key  # Provided only once
    return res
