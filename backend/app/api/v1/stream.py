import asyncio
import json
import logging
from typing import AsyncGenerator
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from sqlalchemy import select, desc
from app.core.database import AsyncSessionLocal
from app.models.event import ActivityEvent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/stream", tags=["Real-Time Streaming"])


async def event_generator() -> AsyncGenerator[str, None]:
    """Stream live events via SSE every 3 seconds to keep dashboard KPIs active."""
    last_seen_id = None
    while True:
        try:
            async with AsyncSessionLocal() as db:
                query = select(ActivityEvent).order_by(desc(ActivityEvent.ingested_at)).limit(5)
                res = await db.execute(query)
                events = res.scalars().all()

                if events:
                    payload = [
                        {
                            "event_id": ev.event_id,
                            "event_type": ev.event_type,
                            "application_id": ev.application_id,
                            "actor": ev.actor_sub,
                            "time": ev.occurred_at.strftime("%H:%M:%S"),
                            "outcome": ev.outcome,
                        }
                        for ev in events
                    ]
                    yield f"event: activity\ndata: {json.dumps(payload)}\n\n"

        except Exception as e:
            logger.error("SSE stream error: %s", e)

        await asyncio.sleep(4)


@router.get("/events")
async def sse_event_stream():
    """Server-Sent Events (SSE) feed for live dashboard activity."""
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
