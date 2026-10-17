import logging
from datetime import datetime, timedelta, date
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy import select, func, desc, distinct
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.user import User
from app.models.event import ActivityEvent, AuthEvent
from app.models.application import Application
from app.models.ai_event import AIUsageEvent
from app.models.alert import Alert
from app.schemas.analytics import (
    AnalyticsOverview,
    ApplicationUsageStats,
    AIUsageStats,
    AIModelUsage,
    TimeSeriesPoint,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analytics", tags=["Analytics & KPIs"])


@router.get("/overview", response_model=AnalyticsOverview)
async def get_analytics_overview(db: AsyncSession = Depends(get_db)):
    """Compute global ecosystem KPIs: DAU, WAU, MAU, event counts, alert counts, and trends."""
    now = datetime.utcnow()
    one_day_ago = now - timedelta(days=1)
    seven_days_ago = now - timedelta(days=7)
    thirty_days_ago = now - timedelta(days=30)

    # 1. User counts
    total_users = await db.scalar(select(func.count()).select_from(User)) or 0

    # DAU (Daily Active Users): distinct user sub active in last 24h
    dau = await db.scalar(
        select(func.count(distinct(ActivityEvent.actor_sub))).where(
            ActivityEvent.occurred_at >= one_day_ago,
            ActivityEvent.actor_sub.is_not(None),
        )
    ) or 0

    # WAU (Weekly Active Users)
    wau = await db.scalar(
        select(func.count(distinct(ActivityEvent.actor_sub))).where(
            ActivityEvent.occurred_at >= seven_days_ago,
            ActivityEvent.actor_sub.is_not(None),
        )
    ) or 0

    # MAU (Monthly Active Users)
    mau = await db.scalar(
        select(func.count(distinct(ActivityEvent.actor_sub))).where(
            ActivityEvent.occurred_at >= thirty_days_ago,
            ActivityEvent.actor_sub.is_not(None),
        )
    ) or 0

    # 2. Event counts
    total_events_today = await db.scalar(
        select(func.count()).select_from(ActivityEvent).where(ActivityEvent.occurred_at >= one_day_ago)
    ) or 0
    total_events_all_time = await db.scalar(select(func.count()).select_from(ActivityEvent)) or 0

    # 3. Alerts
    active_alerts = await db.scalar(
        select(func.count()).select_from(Alert).where(Alert.status.in_(["open", "acknowledged"]))
    ) or 0

    # 4. Logins in 24h
    success_logins = await db.scalar(
        select(func.count()).select_from(AuthEvent).where(
            AuthEvent.occurred_at >= one_day_ago,
            AuthEvent.outcome == "success",
        )
    ) or 0
    failed_logins = await db.scalar(
        select(func.count()).select_from(AuthEvent).where(
            AuthEvent.occurred_at >= one_day_ago,
            AuthEvent.outcome != "success",
        )
    ) or 0

    # 5. AI usage today
    ai_tokens_today = await db.scalar(
        select(func.sum(AIUsageEvent.total_tokens)).where(AIUsageEvent.occurred_at >= one_day_ago)
    ) or 0
    ai_cost_today = await db.scalar(
        select(func.sum(AIUsageEvent.estimated_cost)).where(AIUsageEvent.occurred_at >= one_day_ago)
    ) or 0.0

    # 6. Top applications
    all_apps = (await db.execute(select(Application))).scalars().all()
    top_apps = []
    for a in all_apps:
        app_events = await db.scalar(
            select(func.count()).select_from(ActivityEvent).where(ActivityEvent.application_id == a.id)
        ) or 0
        app_users = await db.scalar(
            select(func.count(distinct(ActivityEvent.actor_sub))).where(ActivityEvent.application_id == a.id)
        ) or 0
        pct = (app_events / max(1, total_events_all_time)) * 100.0
        top_apps.append(
            ApplicationUsageStats(
                application_id=a.id,
                name=a.name,
                event_count=app_events,
                user_count=app_users,
                percentage=round(pct, 1),
                status=a.integration_status,
            )
        )
    top_apps.sort(key=lambda x: x.event_count, reverse=True)

    # 7. 7-day activity trend
    trend = []
    for i in range(6, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        cnt = await db.scalar(
            select(func.count()).select_from(ActivityEvent).where(
                ActivityEvent.occurred_at >= day_start,
                ActivityEvent.occurred_at < day_end,
            )
        ) or 0
        trend.append(
            TimeSeriesPoint(
                date=day_start.strftime("%Y-%m-%d"),
                count=cnt,
            )
        )

    return AnalyticsOverview(
        total_users=total_users,
        dau=dau,
        wau=wau,
        mau=mau,
        total_events_today=total_events_today,
        total_events_all_time=total_events_all_time,
        active_alerts_count=active_alerts,
        successful_logins_24h=success_logins,
        failed_logins_24h=failed_logins,
        ai_tokens_today=int(ai_tokens_today),
        ai_cost_today_usd=float(round(ai_cost_today, 4)),
        top_applications=top_apps,
        activity_trend_7d=trend,
    )


@router.get("/applications", response_model=List[ApplicationUsageStats])
async def get_applications_analytics(db: AsyncSession = Depends(get_db)):
    """Detailed analytics per ecosystem application."""
    apps = (await db.execute(select(Application))).scalars().all()
    total_events = await db.scalar(select(func.count()).select_from(ActivityEvent)) or 1

    stats = []
    for a in apps:
        cnt = await db.scalar(
            select(func.count()).select_from(ActivityEvent).where(ActivityEvent.application_id == a.id)
        ) or 0
        users = await db.scalar(
            select(func.count(distinct(ActivityEvent.actor_sub))).where(ActivityEvent.application_id == a.id)
        ) or 0
        stats.append(
            ApplicationUsageStats(
                application_id=a.id,
                name=a.name,
                event_count=cnt,
                user_count=users,
                percentage=round((cnt / total_events) * 100.0, 1),
                status=a.integration_status,
            )
        )
    stats.sort(key=lambda s: s.event_count, reverse=True)
    return stats


@router.get("/ai-usage", response_model=AIUsageStats)
async def get_ai_analytics(db: AsyncSession = Depends(get_db)):
    """LiteLLM telemetry analytics: token usage, models, estimated costs, and app breakdown."""
    total_reqs = await db.scalar(select(func.count()).select_from(AIUsageEvent)) or 0
    total_tokens = await db.scalar(select(func.sum(AIUsageEvent.total_tokens))) or 0
    p_tokens = await db.scalar(select(func.sum(AIUsageEvent.prompt_tokens))) or 0
    c_tokens = await db.scalar(select(func.sum(AIUsageEvent.completion_tokens))) or 0
    total_cost = await db.scalar(select(func.sum(AIUsageEvent.estimated_cost))) or 0.0
    errors = await db.scalar(
        select(func.count()).select_from(AIUsageEvent).where(AIUsageEvent.status != "success")
    ) or 0

    # Model breakdown
    model_rows = (
        await db.execute(
            select(
                AIUsageEvent.model,
                func.count(),
                func.sum(AIUsageEvent.total_tokens),
                func.sum(AIUsageEvent.estimated_cost),
            ).group_by(AIUsageEvent.model)
        )
    ).all()

    models = [
        AIModelUsage(
            model=row[0],
            requests=row[1],
            tokens=int(row[2] or 0),
            cost=float(round(row[3] or 0.0, 4)),
        )
        for row in model_rows
    ]

    # App breakdown
    app_rows = (
        await db.execute(
            select(
                AIUsageEvent.application_id,
                func.count(),
                func.sum(AIUsageEvent.total_tokens),
                func.sum(AIUsageEvent.estimated_cost),
            ).group_by(AIUsageEvent.application_id)
        )
    ).all()
    apps = [
        {
            "application_id": row[0],
            "requests": row[1],
            "tokens": int(row[2] or 0),
            "cost": float(round(row[3] or 0.0, 4)),
        }
        for row in app_rows
    ]

    # Timeline (last 7 days)
    now = datetime.utcnow()
    timeline = []
    for i in range(6, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        t_tokens = await db.scalar(
            select(func.sum(AIUsageEvent.total_tokens)).where(
                AIUsageEvent.occurred_at >= day_start,
                AIUsageEvent.occurred_at < day_end,
            )
        ) or 0
        timeline.append({"date": day_start.strftime("%Y-%m-%d"), "tokens": int(t_tokens)})

    return AIUsageStats(
        total_requests=total_reqs,
        total_tokens=int(total_tokens),
        prompt_tokens=int(p_tokens),
        completion_tokens=int(c_tokens),
        estimated_cost_usd=float(round(total_cost, 4)),
        error_count=errors,
        models=models,
        applications=apps,
        timeline=timeline,
    )
