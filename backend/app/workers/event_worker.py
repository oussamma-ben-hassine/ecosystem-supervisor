import asyncio
import json
import logging
from datetime import datetime, date
from typing import Dict, Any, List
import redis.asyncio as aioredis
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.event import ActivityEvent, AuthEvent
from app.models.user import User, UserAppAccess
from app.models.data_event import Resource, DataEvent
from app.models.ai_event import AIUsageEvent
from app.models.metric import DailyMetric
from app.models.audit import IngestionFailure
from app.workers.alert_engine import AlertEngine

logger = logging.getLogger(__name__)


async def process_event(event_data: Dict[str, Any]):
    """Idempotently process an event: insert records, update user activity, resource state, metrics and alert rules."""
    async with AsyncSessionLocal() as db:
        try:
            event_id = event_data.get("event_id")
            if not event_id:
                return

            # Check idempotency
            existing = await db.execute(
                select(ActivityEvent).where(ActivityEvent.event_id == event_id)
            )
            if existing.scalar_one_or_none():
                # Already processed
                return

            event_type = event_data.get("event_type", "unknown")
            app_id = event_data.get("application", "unknown")
            occurred_at_raw = event_data.get("occurred_at")
            if isinstance(occurred_at_raw, str):
                occurred_at = datetime.fromisoformat(occurred_at_raw.replace("Z", "+00:00")).replace(tzinfo=None)
            elif isinstance(occurred_at_raw, datetime):
                occurred_at = occurred_at_raw.replace(tzinfo=None)
            else:
                occurred_at = datetime.utcnow()

            actor = event_data.get("actor") or {}
            issuer = actor.get("issuer")
            sub = actor.get("sub")
            email = actor.get("email")
            name = actor.get("name")

            # 1. Update or create user record if actor sub & issuer exist
            if issuer and sub:
                user_id = f"{issuer}:{sub}"
                stmt = select(User).where(User.issuer == issuer, User.sub == sub)
                res = await db.execute(stmt)
                user = res.scalar_one_or_none()

                if not user:
                    user = User(
                        id=user_id,
                        issuer=issuer,
                        sub=sub,
                        email=email,
                        name=name,
                        last_active_at=occurred_at,
                    )
                    db.add(user)
                    await db.flush()
                else:
                    if email and not user.email:
                        user.email = email
                    if name and not user.name:
                        user.name = name
                    if not user.last_active_at or occurred_at > user.last_active_at:
                        user.last_active_at = occurred_at

                # Track UserAppAccess
                access_stmt = select(UserAppAccess).where(
                    UserAppAccess.user_id == user.id,
                    UserAppAccess.application_id == app_id,
                )
                access_res = await db.execute(access_stmt)
                access = access_res.scalar_one_or_none()
                if not access:
                    access = UserAppAccess(
                        user_id=user.id,
                        application_id=app_id,
                        first_access_at=occurred_at,
                        last_access_at=occurred_at,
                    )
                    db.add(access)
                else:
                    access.last_access_at = occurred_at

            # 2. Insert ActivityEvent
            resource = event_data.get("resource") or {}
            res_type = resource.get("type")
            res_id = resource.get("id")

            act_event = ActivityEvent(
                event_id=event_id,
                event_type=event_type,
                event_version=event_data.get("event_version", 1),
                application_id=app_id,
                actor_issuer=issuer,
                actor_sub=sub,
                actor_email=email,
                actor_name=name,
                occurred_at=occurred_at,
                ingested_at=datetime.utcnow(),
                resource_type=res_type,
                resource_id=res_id,
                outcome=event_data.get("outcome", "success"),
                correlation_id=event_data.get("correlation_id"),
                metadata_json=event_data.get("metadata") or {},
            )
            db.add(act_event)

            # 3. Handle Special Event Types
            # 3a. Auth events
            if event_type.startswith("sso.") or event_type.startswith("auth."):
                auth_ev = AuthEvent(
                    id=event_id,
                    event_type=event_type,
                    application_id=app_id,
                    issuer=issuer or "unknown",
                    sub=sub,
                    email=email,
                    outcome=event_data.get("outcome", "success"),
                    occurred_at=occurred_at,
                    metadata_json=event_data.get("metadata") or {},
                )
                db.add(auth_ev)

            # 3b. Data resource operations
            if res_type and res_id:
                res_key = f"{res_type}:{res_id}"
                r_stmt = select(Resource).where(Resource.id == res_key)
                r_res = await db.execute(r_stmt)
                existing_res = r_res.scalar_one_or_none()

                if not existing_res:
                    existing_res = Resource(
                        id=res_key,
                        resource_type=res_type,
                        external_id=str(res_id),
                        application_id=app_id,
                        owner_sub=sub,
                        name=resource.get("name"),
                        mime_type=resource.get("mime_type"),
                        size_bytes=resource.get("size_bytes", 0),
                        is_deleted=1 if "delete" in event_type.lower() else 0,
                        last_action_at=occurred_at,
                    )
                    db.add(existing_res)
                    await db.flush()
                else:
                    if "delete" in event_type.lower():
                        existing_res.is_deleted = 1
                    existing_res.last_action_at = occurred_at

                data_ev = DataEvent(
                    event_id=event_id,
                    operation=event_type,
                    application_id=app_id,
                    resource_id=res_key,
                    actor_sub=sub,
                    bytes_transferred=resource.get("size_bytes", 0),
                    occurred_at=occurred_at,
                    metadata_json=event_data.get("metadata") or {},
                )
                db.add(data_ev)

            # 3c. AI usage events
            if event_type.startswith("ai.") or "tokens" in (event_data.get("metadata") or {}):
                meta = event_data.get("metadata") or {}
                prompt_tokens = meta.get("prompt_tokens", 0)
                completion_tokens = meta.get("completion_tokens", 0)
                total_tokens = meta.get("total_tokens", prompt_tokens + completion_tokens)
                cost = meta.get("cost", meta.get("estimated_cost", 0.0))

                ai_ev = AIUsageEvent(
                    id=event_id,
                    application_id=app_id,
                    user_sub=sub,
                    user_email=email,
                    model=meta.get("model", "default"),
                    prompt_tokens=prompt_tokens,
                    completion_tokens=completion_tokens,
                    total_tokens=total_tokens,
                    estimated_cost=float(cost),
                    duration_ms=meta.get("duration_ms", 0),
                    status="success" if event_data.get("outcome") != "failure" else "error",
                    occurred_at=occurred_at,
                    metadata_json=meta,
                )
                db.add(ai_ev)

            await db.commit()

            # 4. Trigger alert evaluation
            await AlertEngine.evaluate_event(event_data, db)

        except Exception as e:
            logger.error("Failed to process event %s: %s", event_data.get("event_id"), e)
            await db.rollback()
            # Record in dead-letter queue
            try:
                failure = IngestionFailure(
                    application_id=event_data.get("application"),
                    error_reason=str(e),
                    raw_payload=json.dumps(event_data, default=str),
                )
                db.add(failure)
                await db.commit()
            except Exception:
                pass


async def run_worker():
    """Main worker loop reading from Redis Stream."""
    logger.info("Starting Redis Streams Event Worker...")
    r = None
    try:
        r = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        # Ensure group
        try:
            await r.xgroup_create(
                settings.REDIS_STREAM_KEY,
                settings.REDIS_CONSUMER_GROUP,
                id="$",
                mkstream=True,
            )
        except Exception:
            pass
    except Exception as e:
        logger.warning("Worker cannot connect to Redis: %s. Worker will poll periodically.", e)

    while True:
        try:
            if r:
                # Read from Redis stream
                entries = await r.xreadgroup(
                    groupname=settings.REDIS_CONSUMER_GROUP,
                    consumername="worker-1",
                    streams={settings.REDIS_STREAM_KEY: ">"},
                    count=50,
                    block=2000,
                )
                if entries:
                    for stream_name, messages in entries:
                        for msg_id, payload in messages:
                            try:
                                data_str = payload.get("data")
                                if data_str:
                                    event_dict = json.loads(data_str)
                                    await process_event(event_dict)
                                await r.xack(settings.REDIS_STREAM_KEY, settings.REDIS_CONSUMER_GROUP, msg_id)
                            except Exception as ex:
                                logger.error("Worker error processing message %s: %s", msg_id, ex)
            else:
                await asyncio.sleep(5)
        except Exception as loop_err:
            logger.error("Worker stream read loop error: %s", loop_err)
            await asyncio.sleep(3)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(run_worker())
