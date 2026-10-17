import uuid
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.alert import AlertRule, Alert
from app.models.event import ActivityEvent, AuthEvent

logger = logging.getLogger(__name__)


class AlertEngine:
    """Evaluates incoming events against registered security and anomaly rules.
    Performs smart deduplication, threshold windowing, and status tracking.
    """

    @staticmethod
    async def evaluate_event(event: Dict[str, Any], db: AsyncSession):
        event_type = event.get("event_type", "")
        app_id = event.get("application", "")
        actor = event.get("actor") or {}
        sub = actor.get("sub") or "unknown"
        outcome = event.get("outcome", "success")

        # 1. Rule: Multiple failed logins
        if event_type in ("sso.login", "auth.login") and outcome in ("failure", "denied"):
            await AlertEngine._check_threshold_alert(
                db=db,
                rule_id="rule_failed_logins",
                rule_name="Multiple Failed Login Attempts",
                app_id=app_id,
                severity="critical",
                dedup_key=f"failed_logins:{sub}:{datetime.utcnow().strftime('%Y-%m-%d-%H')}",
                title=f"Repeated login failures for user {sub}",
                message=f"Multiple authentication failures detected for actor {sub} in application {app_id}.",
                threshold=3,
                metadata={"user_sub": sub, "event_type": event_type, "app": app_id},
            )

        # 2. Rule: Mass Deletions
        elif "delete" in event_type.lower() or event_type in ("file.deleted", "cv.deleted", "note.deleted"):
            await AlertEngine._check_threshold_alert(
                db=db,
                rule_id="rule_mass_deletion",
                rule_name="Mass Resource Deletion Detected",
                app_id=app_id,
                severity="critical",
                dedup_key=f"mass_deletion:{sub}:{datetime.utcnow().strftime('%Y-%m-%d-%H')}",
                title=f"High deletion rate by user {sub}",
                message=f"Actor {sub} deleted multiple resources in application {app_id}.",
                threshold=5,
                metadata={"user_sub": sub, "event_type": event_type, "app": app_id},
            )

        # 3. Rule: Mass Downloads / Data Export
        elif "download" in event_type.lower() or "export" in event_type.lower():
            await AlertEngine._check_threshold_alert(
                db=db,
                rule_id="rule_high_downloads",
                rule_name="Abnormal Download or Export Rate",
                app_id=app_id,
                severity="warning",
                dedup_key=f"high_downloads:{sub}:{datetime.utcnow().strftime('%Y-%m-%d-%H')}",
                title=f"Unusual download/export volume by {sub}",
                message=f"High frequency of download/export operations performed by {sub} on {app_id}.",
                threshold=10,
                metadata={"user_sub": sub, "event_type": event_type, "app": app_id},
            )

        # 4. Rule: Application Error Spike
        elif outcome == "failure" or "error" in event_type.lower():
            await AlertEngine._check_threshold_alert(
                db=db,
                rule_id="rule_error_spike",
                rule_name="Application Error Spike",
                app_id=app_id,
                severity="warning",
                dedup_key=f"app_errors:{app_id}:{datetime.utcnow().strftime('%Y-%m-%d-%H')}",
                title=f"Spike in errors reported by {app_id}",
                message=f"Multiple failed operations reported by application {app_id}.",
                threshold=8,
                metadata={"app": app_id, "event_type": event_type},
            )

    @staticmethod
    async def _check_threshold_alert(
        db: AsyncSession,
        rule_id: str,
        rule_name: str,
        app_id: str,
        severity: str,
        dedup_key: str,
        title: str,
        message: str,
        threshold: int,
        metadata: Dict[str, Any],
    ):
        try:
            # Check if alert already exists for this deduplication key
            stmt = select(Alert).where(Alert.deduplication_key == dedup_key)
            result = await db.execute(stmt)
            existing_alert = result.scalar_one_or_none()

            if existing_alert:
                existing_alert.occurrence_count += 1
                existing_alert.last_seen_at = datetime.utcnow()
                if existing_alert.status == "resolved":
                    existing_alert.status = "open"  # Re-open if reoccurring
                await db.commit()
            else:
                # Create rule if doesn't exist
                rule_stmt = select(AlertRule).where(AlertRule.id == rule_id)
                rule_res = await db.execute(rule_stmt)
                rule = rule_res.scalar_one_or_none()
                if not rule:
                    rule = AlertRule(
                        id=rule_id,
                        name=rule_name,
                        rule_type=rule_id.replace("rule_", ""),
                        severity=severity,
                        threshold=threshold,
                        window_seconds=3600,
                        is_enabled=True,
                    )
                    db.add(rule)
                    await db.flush()

                new_alert = Alert(
                    id=str(uuid.uuid4()),
                    rule_id=rule_id,
                    application_id=app_id,
                    severity=severity,
                    title=title,
                    message=message,
                    status="open",
                    deduplication_key=dedup_key,
                    occurrence_count=1,
                    first_seen_at=datetime.utcnow(),
                    last_seen_at=datetime.utcnow(),
                    metadata_json=metadata,
                )
                db.add(new_alert)
                await db.commit()
                logger.warning("Triggered alert: %s (%s)", title, severity)

        except Exception as e:
            logger.error("Error in alert engine threshold check: %s", e)
            await db.rollback()
