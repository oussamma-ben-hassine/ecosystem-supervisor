import csv
import io
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.user import User, UserAppAccess
from app.models.application import Application
from app.models.event import ActivityEvent
from app.schemas.user import (
    UserSummary,
    UserActivityResponse,
    UserActivityTimelineItem,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["Users Directory & Activity 360"])


@router.get("", response_model=List[UserSummary])
async def list_users(
    search: Optional[str] = Query(None, description="Search by name, email, or sub"),
    app_id: Optional[str] = Query(None, description="Filter by accessible application"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """List users in the central directory with access information and activity stats."""
    stmt = select(User).order_by(desc(User.last_active_at))

    if search:
        search_pattern = f"%{search}%"
        stmt = stmt.where(
            (User.name.ilike(search_pattern))
            | (User.email.ilike(search_pattern))
            | (User.sub.ilike(search_pattern))
        )

    stmt = stmt.limit(limit).offset(offset)
    result = await db.execute(stmt)
    users = result.scalars().all()

    response = []
    for u in users:
        # Get accessible apps
        apps_res = await db.execute(
            select(UserAppAccess.application_id).where(UserAppAccess.user_id == u.id)
        )
        accessible_apps = [row[0] for row in apps_res.all()]

        if app_id and app_id not in accessible_apps:
            continue

        # Count total events
        ev_count = await db.scalar(
            select(func.count()).select_from(ActivityEvent).where(
                ActivityEvent.actor_issuer == u.issuer,
                ActivityEvent.actor_sub == u.sub,
            )
        )

        response.append(
            UserSummary(
                id=u.id,
                issuer=u.issuer,
                sub=u.sub,
                email=u.email,
                name=u.name,
                avatar_url=u.avatar_url,
                role=u.role,
                is_active=u.is_active,
                last_active_at=u.last_active_at,
                created_at=u.created_at,
                accessible_apps=accessible_apps,
                total_events=ev_count or 0,
            )
        )

    return response


@router.get("/{user_id:path}/activity", response_model=UserActivityResponse)
async def get_user_activity_360(
    user_id: str,
    application_id: Optional[str] = Query(None, description="Filter by source application"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    date_from: Optional[datetime] = Query(None, description="Start date filter"),
    date_to: Optional[datetime] = Query(None, description="End date filter"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """User Activity 360° endpoint:
    Aggregates all cross-application actions in a unified timeline.
    Highlights unintegrated applications and coverage status to prevent false completeness assumptions.
    """
    # Find user by ID or sub
    user = await db.scalar(
        select(User).where((User.id == user_id) | (User.sub == user_id))
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch all registered apps in ecosystem
    all_apps = (await db.execute(select(Application))).scalars().all()
    app_map = {a.id: a.name for a in all_apps}
    all_app_ids = set(app_map.keys())

    # Build activity query
    query = select(ActivityEvent).where(
        ActivityEvent.actor_issuer == user.issuer,
        ActivityEvent.actor_sub == user.sub,
    )

    if application_id:
        query = query.where(ActivityEvent.application_id == application_id)
    if event_type:
        query = query.where(ActivityEvent.event_type == event_type)
    if date_from:
        query = query.where(ActivityEvent.occurred_at >= date_from)
    if date_to:
        query = query.where(ActivityEvent.occurred_at <= date_to)

    # Total matching events
    count_stmt = select(func.count()).select_from(query.subquery())
    total_events = await db.scalar(count_stmt) or 0

    # Paged query
    query = (
        query.order_by(desc(ActivityEvent.occurred_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    res = await db.execute(query)
    events = res.scalars().all()

    timeline = []
    covered_apps = set()
    for ev in events:
        covered_apps.add(ev.application_id)
        timeline.append(
            UserActivityTimelineItem(
                event_id=ev.event_id,
                event_type=ev.event_type,
                application_id=ev.application_id,
                application_name=app_map.get(ev.application_id, ev.application_id),
                occurred_at=ev.occurred_at,
                outcome=ev.outcome,
                resource_type=ev.resource_type,
                resource_id=ev.resource_id,
                resource_name=(ev.metadata_json or {}).get("name")
                or (ev.metadata_json or {}).get("title"),
                metadata=ev.metadata_json or {},
                correlation_id=ev.correlation_id,
            )
        )

    # Calculate unintegrated or inactive apps
    unintegrated_apps = list(all_app_ids - covered_apps)

    # Get user accessible apps
    access_res = await db.execute(
        select(UserAppAccess.application_id).where(UserAppAccess.user_id == user.id)
    )
    user_apps = [r[0] for r in access_res.all()]

    user_summary = UserSummary(
        id=user.id,
        issuer=user.issuer,
        sub=user.sub,
        email=user.email,
        name=user.name,
        avatar_url=user.avatar_url,
        role=user.role,
        is_active=user.is_active,
        last_active_at=user.last_active_at,
        created_at=user.created_at,
        accessible_apps=user_apps,
        total_events=total_events,
    )

    return UserActivityResponse(
        user=user_summary,
        timeline=timeline,
        total_events=total_events,
        page=page,
        page_size=page_size,
        covered_apps=list(covered_apps),
        unintegrated_apps=unintegrated_apps,
        date_range={"from": date_from, "to": date_to},
    )


@router.get("/{user_id:path}/export")
async def export_user_activity_csv(
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Export the user's activity log as a clean RFC 4180 CSV document."""
    user = await db.scalar(
        select(User).where((User.id == user_id) | (User.sub == user_id))
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    events = (
        await db.execute(
            select(ActivityEvent)
            .where(
                ActivityEvent.actor_issuer == user.issuer,
                ActivityEvent.actor_sub == user.sub,
            )
            .order_by(desc(ActivityEvent.occurred_at))
            .limit(2000)
        )
    ).scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Event ID",
        "Timestamp (UTC)",
        "Application",
        "Event Type",
        "Outcome",
        "Resource Type",
        "Resource ID",
        "Correlation ID",
    ])

    for ev in events:
        writer.writerow([
            ev.event_id,
            ev.occurred_at.isoformat(),
            ev.application_id,
            ev.event_type,
            ev.outcome,
            ev.resource_type or "",
            ev.resource_id or "",
            ev.correlation_id or "",
        ])

    output.seek(0)
    filename = f"activity_360_{user.sub}_{datetime.utcnow().strftime('%Y%m%d')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
