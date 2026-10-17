import logging
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_app_by_api_key
from app.core.redis import publish_event_to_stream
from app.schemas.event import (
    EventIngestSchema,
    EventBatchIngestSchema,
    EventBatchResponseSchema,
)
from app.workers.event_worker import process_event

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/events", tags=["Event Ingestion"])


@router.post("/batch", response_model=EventBatchResponseSchema)
async def ingest_batch_events(
    payload: EventBatchIngestSchema,
    current_app: Dict[str, Any] = Depends(get_current_app_by_api_key),
):
    """Secure batch event ingestion endpoint for ecosystem applications.
    The source application is verified from the server-to-server API Key credential.
    Events are published to Redis Streams, with automatic synchronous fallback.
    """
    app_id = current_app["app_id"]
    processed = 0
    failed = 0
    errors: List[str] = []

    for event in payload.events:
        try:
            event_dict = event.model_dump()
            # Enforce verified application identity from authenticated API key
            event_dict["application"] = app_id

            # Try Redis Stream async publishing first
            msg_id = await publish_event_to_stream(event_dict)
            if not msg_id:
                # Redis unavailable or failed: process synchronously directly
                await process_event(event_dict)

            processed += 1
        except Exception as e:
            logger.error("Failed ingesting event %s: %s", event.event_id, e)
            failed += 1
            errors.append(f"Event {event.event_id}: {str(e)}")

    return EventBatchResponseSchema(
        status="success" if failed == 0 else "partial_success",
        processed=processed,
        failed=failed,
        errors=errors if errors else None,
    )


@router.post("", response_model=EventBatchResponseSchema)
async def ingest_single_event(
    event: EventIngestSchema,
    current_app: Dict[str, Any] = Depends(get_current_app_by_api_key),
):
    """Ingest a single event."""
    app_id = current_app["app_id"]
    event_dict = event.model_dump()
    event_dict["application"] = app_id

    try:
        msg_id = await publish_event_to_stream(event_dict)
        if not msg_id:
            await process_event(event_dict)

        return EventBatchResponseSchema(
            status="success",
            processed=1,
            failed=0,
        )
    except Exception as e:
        logger.error("Failed single event ingestion: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to ingest event: {str(e)}",
        )
