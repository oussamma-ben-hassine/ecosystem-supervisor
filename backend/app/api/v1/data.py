import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.data_event import Resource, DataEvent
from app.models.application import Application

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/data", tags=["Data Supervision"])


@router.get("/resources")
async def list_resources(
    application_id: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    owner_sub: Optional[str] = Query(None),
    is_deleted: Optional[int] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """List tracked resources across apps without ever exposing private document bodies."""
    query = select(Resource)
    if application_id:
        query = query.where(Resource.application_id == application_id)
    if resource_type:
        query = query.where(Resource.resource_type == resource_type)
    if owner_sub:
        query = query.where(Resource.owner_sub == owner_sub)
    if is_deleted is not None:
        query = query.where(Resource.is_deleted == is_deleted)

    count_stmt = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_stmt) or 0

    query = query.order_by(desc(Resource.last_action_at)).limit(limit).offset(offset)
    res = await db.execute(query)
    items = res.scalars().all()

    return {
        "items": [
            {
                "id": r.id,
                "resource_type": r.resource_type,
                "external_id": r.external_id,
                "application_id": r.application_id,
                "owner_sub": r.owner_sub,
                "name": r.name,
                "mime_type": r.mime_type,
                "size_bytes": r.size_bytes,
                "is_deleted": bool(r.is_deleted),
                "last_action_at": r.last_action_at.isoformat(),
                "metadata": r.metadata_json or {},
            }
            for r in items
        ],
        "total": total,
    }


@router.get("/events")
async def list_data_events(
    operation: Optional[str] = Query(None),
    application_id: Optional[str] = Query(None),
    actor_sub: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """List data lifecycle operations (create, update, delete, download, share, export)."""
    query = select(DataEvent)
    if operation:
        query = query.where(DataEvent.operation.ilike(f"%{operation}%"))
    if application_id:
        query = query.where(DataEvent.application_id == application_id)
    if actor_sub:
        query = query.where(DataEvent.actor_sub == actor_sub)

    count_stmt = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_stmt) or 0

    query = query.order_by(desc(DataEvent.occurred_at)).limit(limit).offset(offset)
    res = await db.execute(query)
    items = res.scalars().all()

    return {
        "items": [
            {
                "id": e.id,
                "event_id": e.event_id,
                "operation": e.operation,
                "application_id": e.application_id,
                "resource_id": e.resource_id,
                "actor_sub": e.actor_sub,
                "bytes_transferred": e.bytes_transferred,
                "occurred_at": e.occurred_at.isoformat(),
                "metadata": e.metadata_json or {},
            }
            for e in items
        ],
        "total": total,
    }
