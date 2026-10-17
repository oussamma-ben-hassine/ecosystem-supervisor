import csv
import io
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.event import ActivityEvent
from app.models.application import Application

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/events", tags=["Global Activity Journal"])


@router.get("")
async def list_global_events(
    application_id: Optional[str] = Query(None, description="Filter by application"),
    event_type: Optional[str] = Query(None, description="Filter by event type prefix or exact"),
    outcome: Optional[str] = Query(None, description="success, failure, denied"),
    actor_sub: Optional[str] = Query(None, description="Filter by user sub"),
    correlation_id: Optional[str] = Query(None, description="Trace by correlation ID"),
    search: Optional[str] = Query(None, description="General search in event_id or resource_id"),
    date_from: Optional[datetime] = Query(None, description="Start date"),
    date_to: Optional[datetime] = Query(None, description="End date"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """Global activity journal querying endpoint with full filters and pagination."""
    query = select(ActivityEvent)

    if application_id:
        query = query.where(ActivityEvent.application_id == application_id)
    if event_type:
        query = query.where(ActivityEvent.event_type.ilike(f"%{event_type}%"))
    if outcome:
        query = query.where(ActivityEvent.outcome == outcome)
    if actor_sub:
        query = query.where(ActivityEvent.actor_sub == actor_sub)
    if correlation_id:
        query = query.where(ActivityEvent.correlation_id == correlation_id)
    if search:
        search_pat = f"%{search}%"
        query = query.where(
            (ActivityEvent.event_id.ilike(search_pat))
            | (ActivityEvent.resource_id.ilike(search_pat))
            | (ActivityEvent.actor_email.ilike(search_pat))
        )
    if date_from:
        query = query.where(ActivityEvent.occurred_at >= date_from)
    if date_to:
        query = query.where(ActivityEvent.occurred_at <= date_to)

    count_stmt = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_stmt) or 0

    query = (
        query.order_by(desc(ActivityEvent.occurred_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    res = await db.execute(query)
    events = res.scalars().all()

    # Get app map
    apps = (await db.execute(select(Application))).scalars().all()
    app_map = {a.id: a.name for a in apps}

    results = []
    for ev in events:
        results.append({
            "event_id": ev.event_id,
            "event_type": ev.event_type,
            "event_version": ev.event_version,
            "application_id": ev.application_id,
            "application_name": app_map.get(ev.application_id, ev.application_id),
            "actor": {
                "issuer": ev.actor_issuer,
                "sub": ev.actor_sub,
                "email": ev.actor_email,
                "name": ev.actor_name,
            },
            "occurred_at": ev.occurred_at.isoformat(),
            "ingested_at": ev.ingested_at.isoformat(),
            "resource": {
                "type": ev.resource_type,
                "id": ev.resource_id,
            } if ev.resource_type else None,
            "outcome": ev.outcome,
            "correlation_id": ev.correlation_id,
            "metadata": ev.metadata_json or {},
        })

    return {
        "items": results,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/{event_id}")
async def get_event_detail(event_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch complete raw details for a specific event."""
    ev = await db.scalar(
        select(ActivityEvent).where(ActivityEvent.event_id == event_id)
    )
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")

    return {
        "event_id": ev.event_id,
        "event_type": ev.event_type,
        "event_version": ev.event_version,
        "application_id": ev.application_id,
        "actor": {
            "issuer": ev.actor_issuer,
            "sub": ev.actor_sub,
            "email": ev.actor_email,
            "name": ev.actor_name,
        },
        "occurred_at": ev.occurred_at.isoformat(),
        "ingested_at": ev.ingested_at.isoformat(),
        "resource": {
            "type": ev.resource_type,
            "id": ev.resource_id,
        },
        "outcome": ev.outcome,
        "correlation_id": ev.correlation_id,
        "client_ip": ev.client_ip,
        "user_agent": ev.user_agent,
        "metadata": ev.metadata_json or {},
    }
