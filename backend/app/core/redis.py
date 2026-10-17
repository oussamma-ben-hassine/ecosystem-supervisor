import json
import logging
from typing import Optional, Dict, Any
import redis.asyncio as aioredis
from app.core.config import settings

logger = logging.getLogger(__name__)

redis_client: Optional[aioredis.Redis] = None


async def init_redis():
    global redis_client
    try:
        redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=2,
            socket_timeout=2,
        )
        await redis_client.ping()
        logger.info("Successfully connected to Redis at %s", settings.REDIS_URL)

        # Ensure stream and consumer group exist
        try:
            await redis_client.xgroup_create(
                name=settings.REDIS_STREAM_KEY,
                groupname=settings.REDIS_CONSUMER_GROUP,
                id="$",
                mkstream=True,
            )
        except Exception:
            # Group might already exist
            pass

    except Exception as e:
        logger.warning("Redis is currently unavailable (%s). Falling back to direct DB sync mode.", e)
        redis_client = None


async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None


async def publish_event_to_stream(event_dict: Dict[str, Any]) -> Optional[str]:
    """Publish an event to the Redis Stream for async worker ingestion.
    Returns stream message ID or None if Redis unavailable.
    """
    global redis_client
    if redis_client is None:
        return None
    try:
        payload = {"data": json.dumps(event_dict, default=str)}
        msg_id = await redis_client.xadd(settings.REDIS_STREAM_KEY, payload)
        return msg_id
    except Exception as e:
        logger.error("Failed to publish event to Redis stream: %s", e)
        return None
