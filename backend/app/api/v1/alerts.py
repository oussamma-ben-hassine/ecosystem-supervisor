import logging
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.alert import Alert, AlertRule
from app.schemas.alert import AlertResponse, AlertRuleResponse, AlertResolveRequest

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/alerts", tags=["Alerts & Anomaly Detection"])


@router.get("", response_model=List[AlertResponse])
async def list_alerts(
    status: Optional[str] = Query(None, description="open, acknowledged, resolved"),
    severity: Optional[str] = Query(None, description="critical, warning, info"),
    application_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List system security alerts and anomalies with severity sorting."""
    query = select(Alert)
    if status:
        query = query.where(Alert.status == status)
    if severity:
        query = query.where(Alert.severity == severity)
    if application_id:
        query = query.where(Alert.application_id == application_id)

    query = query.order_by(desc(Alert.last_seen_at)).limit(limit)
    res = await db.execute(query)
    alerts = res.scalars().all()

    return [
        AlertResponse(
            id=a.id,
            rule_id=a.rule_id,
            application_id=a.application_id,
            severity=a.severity,
            title=a.title,
            message=a.message,
            status=a.status,
            occurrence_count=a.occurrence_count,
            first_seen_at=a.first_seen_at,
            last_seen_at=a.last_seen_at,
            resolved_at=a.resolved_at,
            resolved_by=a.resolved_by,
            metadata=a.metadata_json or {},
        )
        for a in alerts
    ]


@router.post("/{alert_id}/resolve", response_model=AlertResponse)
async def resolve_alert(
    alert_id: str,
    payload: AlertResolveRequest,
    db: AsyncSession = Depends(get_db),
):
    """Acknowledge or resolve an active alert."""
    alert = await db.scalar(select(Alert).where(Alert.id == alert_id))
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = "resolved"
    alert.resolved_at = datetime.utcnow()
    alert.resolved_by = payload.note or "Administrator"
    await db.commit()
    await db.refresh(alert)

    return AlertResponse(
        id=alert.id,
        rule_id=alert.rule_id,
        application_id=alert.application_id,
        severity=alert.severity,
        title=alert.title,
        message=alert.message,
        status=alert.status,
        occurrence_count=alert.occurrence_count,
        first_seen_at=alert.first_seen_at,
        last_seen_at=alert.last_seen_at,
        resolved_at=alert.resolved_at,
        resolved_by=alert.resolved_by,
        metadata=alert.metadata_json or {},
    )


@router.get("/rules", response_model=List[AlertRuleResponse])
async def list_alert_rules(db: AsyncSession = Depends(get_db)):
    """List configurable anomaly and security alert rules."""
    rules = (await db.execute(select(AlertRule).order_by(AlertRule.name))).scalars().all()
    return rules
