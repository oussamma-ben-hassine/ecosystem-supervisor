import os
import time
import uuid
import queue
import atexit
import logging
import threading
from datetime import datetime
from typing import Dict, Any, Optional, List
import httpx

logger = logging.getLogger("supervisor_sdk")


class SupervisorClient:
    """Official Python SDK client for oussamma.tn Ecosystem Supervisor.
    Features:
    - Thread-safe non-blocking event queue
    - Periodic and batch auto-flushing
    - Exponential backoff retries
    - Zero interference with host app execution
    """

    def __init__(
        self,
        endpoint: Optional[str] = None,
        api_key: Optional[str] = None,
        app_id: Optional[str] = None,
        batch_size: int = 25,
        flush_interval_sec: float = 3.0,
        max_retries: int = 3,
        timeout_sec: float = 4.0,
    ):
        self.endpoint = (
            endpoint
            or os.getenv("SUPERVISOR_URL")
            or "https://supervisor.oussamma.tn"
        ).rstrip("/")
        self.api_key = api_key or os.getenv("SUPERVISOR_API_KEY") or ""
        self.app_id = app_id or os.getenv("SUPERVISOR_APP_ID") or ""
        self.batch_size = batch_size
        self.flush_interval = flush_interval_sec
        self.max_retries = max_retries
        self.timeout = timeout_sec

        self._queue: queue.Queue = queue.Queue(maxsize=1000)
        self._running = True
        self._worker_thread = threading.Thread(target=self._worker_loop, daemon=True)
        self._worker_thread.start()

        atexit.register(self.close)

    def track(
        self,
        event_type: str,
        actor: Optional[Dict[str, Any]] = None,
        resource: Optional[Dict[str, Any]] = None,
        outcome: str = "success",
        metadata: Optional[Dict[str, Any]] = None,
        correlation_id: Optional[str] = None,
        occurred_at: Optional[datetime] = None,
    ):
        """Asynchronously enqueue an event for supervisor ingestion."""
        if not self.api_key:
            return

        ev = {
            "event_id": str(uuid.uuid4()),
            "event_type": event_type,
            "event_version": 1,
            "application": self.app_id,
            "actor": actor,
            "occurred_at": (occurred_at or datetime.utcnow()).isoformat() + "Z",
            "resource": resource,
            "outcome": outcome,
            "metadata": metadata or {},
            "correlation_id": correlation_id,
        }

        try:
            self._queue.put_nowait(ev)
        except queue.Full:
            logger.warning("Supervisor SDK queue full. Dropping non-critical event %s", event_type)

    def identify(self, issuer: str, sub: str, email: Optional[str] = None, name: Optional[str] = None):
        """Identify an authenticated user."""
        self.track(
            event_type="user.identified",
            actor={"issuer": issuer, "sub": sub, "email": email, "name": name},
        )

    def report_usage(
        self,
        model: str,
        prompt_tokens: int,
        completion_tokens: int,
        total_tokens: Optional[int] = None,
        cost: float = 0.0,
        duration_ms: int = 0,
        request_id: Optional[str] = None,
        user_sub: Optional[str] = None,
        user_email: Optional[str] = None,
        status: str = "success",
    ):
        """Report AI token and model consumption metrics."""
        self.track(
            event_type="ai.completion",
            actor=(
                {"issuer": os.getenv("SSO_ISSUER", "https://sso-a.oussamma.tn"), "sub": user_sub, "email": user_email}
                if user_sub
                else None
            ),
            outcome="failure" if status != "success" else "success",
            metadata={
                "model": model,
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": total_tokens or (prompt_tokens + completion_tokens),
                "cost": cost,
                "duration_ms": duration_ms,
                "request_id": request_id,
            },
        )

    def flush(self):
        """Force flush current queue."""
        batch = []
        while not self._queue.empty() and len(batch) < self.batch_size:
            try:
                batch.append(self._queue.get_nowait())
            except queue.Empty:
                break
        if batch:
            self._send_batch(batch)

    def _worker_loop(self):
        while self._running:
            time.sleep(self.flush_interval)
            try:
                self.flush()
            except Exception as e:
                logger.error("Supervisor SDK background flush error: %s", e)

    def _send_batch(self, batch: List[Dict[str, Any]]):
        if not self.api_key or not batch:
            return

        url = f"{self.endpoint}/api/v1/events/batch"
        headers = {
            "Content-Type": "application/json",
            "X-Supervisor-Key": self.api_key,
        }

        for attempt in range(self.max_retries):
            try:
                with httpx.Client(timeout=self.timeout) as client:
                    resp = client.post(url, headers=headers, json={"events": batch})
                    if resp.status_code in (200, 201):
                        return
            except Exception:
                time.sleep(0.5 * (2**attempt))

    def close(self):
        self._running = False
        try:
            self.flush()
        except Exception:
            pass


_default_client: Optional[SupervisorClient] = None


def init_supervisor(**kwargs) -> SupervisorClient:
    global _default_client
    _default_client = SupervisorClient(**kwargs)
    return _default_client


def get_supervisor() -> SupervisorClient:
    global _default_client
    if _default_client is None:
        _default_client = SupervisorClient()
    return _default_client
