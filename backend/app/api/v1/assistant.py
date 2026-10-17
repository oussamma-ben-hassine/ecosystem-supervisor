import json
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func, desc, distinct
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.models.event import ActivityEvent, AuthEvent
from app.models.application import Application
from app.models.data_event import DataEvent
from app.models.ai_event import AIUsageEvent
from app.models.alert import Alert
from app.schemas.assistant import (
    AssistantQueryRequest,
    AssistantQueryResponse,
    AssistantToolCall,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/assistant", tags=["AI Supervisor Assistant"])

# Safe, restricted internal query tools callable by the AI Assistant
async def tool_get_user_activity(db: AsyncSession, sub: str, limit: int = 15) -> Dict[str, Any]:
    """Retrieve recent authorized activity for a specific user."""
    events = (
        await db.execute(
            select(ActivityEvent)
            .where(ActivityEvent.actor_sub == sub)
            .order_by(desc(ActivityEvent.occurred_at))
            .limit(limit)
        )
    ).scalars().all()

    return {
        "user_sub": sub,
        "recent_events": [
            {
                "type": ev.event_type,
                "app": ev.application_id,
                "time": ev.occurred_at.isoformat(),
                "outcome": ev.outcome,
                "resource": ev.resource_type,
            }
            for ev in events
        ],
    }


async def tool_get_login_stats(db: AsyncSession, hours: int = 24) -> Dict[str, Any]:
    """Retrieve authentication metrics."""
    since = datetime.utcnow() - timedelta(hours=hours)
    success = await db.scalar(
        select(func.count()).select_from(AuthEvent).where(
            AuthEvent.occurred_at >= since, AuthEvent.outcome == "success"
        )
    ) or 0
    failures = await db.scalar(
        select(func.count()).select_from(AuthEvent).where(
            AuthEvent.occurred_at >= since, AuthEvent.outcome != "success"
        )
    ) or 0
    unique_users = await db.scalar(
        select(func.count(distinct(AuthEvent.sub))).where(
            AuthEvent.occurred_at >= since, AuthEvent.outcome == "success"
        )
    ) or 0
    return {
        "period_hours": hours,
        "successful_logins": success,
        "failed_logins": failures,
        "unique_users_connected": unique_users,
    }


async def tool_get_top_apps(db: AsyncSession) -> Dict[str, Any]:
    """Retrieve most used applications."""
    rows = (
        await db.execute(
            select(ActivityEvent.application_id, func.count().label("cnt"))
            .group_by(ActivityEvent.application_id)
            .order_by(desc("cnt"))
            .limit(5)
        )
    ).all()
    return {"top_applications": [{"app": r[0], "events": r[1]} for r in rows]}


async def tool_get_ai_consumption(db: AsyncSession, days: int = 7) -> Dict[str, Any]:
    """Retrieve AI token usage and estimated costs."""
    since = datetime.utcnow() - timedelta(days=days)
    total_tokens = await db.scalar(
        select(func.sum(AIUsageEvent.total_tokens)).where(AIUsageEvent.occurred_at >= since)
    ) or 0
    cost = await db.scalar(
        select(func.sum(AIUsageEvent.estimated_cost)).where(AIUsageEvent.occurred_at >= since)
    ) or 0.0
    return {
        "period_days": days,
        "total_tokens": int(total_tokens),
        "estimated_cost_usd": round(cost, 4),
    }


async def tool_get_active_alerts(db: AsyncSession) -> Dict[str, Any]:
    """Retrieve active anomalies and alerts."""
    alerts = (
        await db.execute(
            select(Alert).where(Alert.status.in_(["open", "acknowledged"])).order_by(desc(Alert.last_seen_at)).limit(10)
        )
    ).scalars().all()
    return {
        "active_alerts_count": len(alerts),
        "alerts": [
            {"title": a.title, "severity": a.severity, "app": a.application_id, "count": a.occurrence_count}
            for a in alerts
        ],
    }


@router.post("/query", response_model=AssistantQueryResponse)
async def query_assistant(payload: AssistantQueryRequest, db: AsyncSession = Depends(get_db)):
    """Natural language supervisor assistant connected to LiteLLM with safe, restricted analytical tool-calling."""
    start_time = time.time()
    query_lower = payload.query.lower()
    tools_executed: List[AssistantToolCall] = []
    context_data: Dict[str, Any] = {}

    # Smart intent recognition to invoke authorized read-only tools
    if "qu'a fait" in query_lower or "utilisateur" in query_lower or "activity" in query_lower:
        # Check target user
        user_sub = payload.target_user_id or "user-oussamma-001"
        res = await tool_get_user_activity(db, user_sub)
        context_data["user_activity"] = res
        tools_executed.append(
            AssistantToolCall(
                tool="tool_get_user_activity",
                args={"sub": user_sub},
                result_summary=f"Found {len(res['recent_events'])} events for user {user_sub}",
            )
        )

    if "connecté" in query_lower or "connexion" in query_lower or "login" in query_lower:
        res = await tool_get_login_stats(db)
        context_data["login_stats"] = res
        tools_executed.append(
            AssistantToolCall(
                tool="tool_get_login_stats",
                args={"hours": 24},
                result_summary=f"{res['unique_users_connected']} unique users, {res['successful_logins']} success, {res['failed_logins']} failed",
            )
        )

    if "application" in query_lower or "utilisée" in query_lower or "top" in query_lower:
        res = await tool_get_top_apps(db)
        context_data["top_apps"] = res
        tools_executed.append(
            AssistantToolCall(
                tool="tool_get_top_apps",
                args={},
                result_summary=f"Top apps: {', '.join([x['app'] for x in res['top_applications']])}",
            )
        )

    if "ia" in query_lower or "token" in query_lower or "consommation" in query_lower or "litellm" in query_lower:
        res = await tool_get_ai_consumption(db)
        context_data["ai_consumption"] = res
        tools_executed.append(
            AssistantToolCall(
                tool="tool_get_ai_consumption",
                args={"days": 7},
                result_summary=f"{res['total_tokens']} tokens, ${res['estimated_cost_usd']} USD",
            )
        )

    if "alerte" in query_lower or "inhabituel" in query_lower or "anomalie" in query_lower or "sécurité" in query_lower:
        res = await tool_get_active_alerts(db)
        context_data["active_alerts"] = res
        tools_executed.append(
            AssistantToolCall(
                tool="tool_get_active_alerts",
                args={},
                result_summary=f"{res['active_alerts_count']} active alerts found",
            )
        )

    # If no tool matched, collect general overview
    if not tools_executed:
        res_apps = await tool_get_top_apps(db)
        res_logins = await tool_get_login_stats(db)
        res_alerts = await tool_get_active_alerts(db)
        context_data["overview"] = {
            "top_apps": res_apps,
            "logins": res_logins,
            "alerts": res_alerts,
        }
        tools_executed.append(
            AssistantToolCall(
                tool="tool_get_general_overview",
                args={},
                result_summary="Aggregated ecosystem general status",
            )
        )

    # Call LiteLLM API
    system_prompt = (
        "Tu es l'Assistant IA Superviseur de l'écosystème oussamma.tn. "
        "Tu réponds en français, avec clarté, précision et concision. "
        "Tu t'appuies STRICTEMENT sur les données fournies par les outils de supervision autorisés. "
        "Tu n'inventes aucune donnée et tu ne divulgues jamais de mots de passe, tokens ou secrets."
    )

    user_prompt = (
        f"Question de l'administrateur : {payload.query}\n\n"
        f"Données vérifiées du superviseur :\n{json.dumps(context_data, indent=2, ensure_ascii=False)}"
    )

    answer_text = ""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{settings.LITELLM_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.LITELLM_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.LITELLM_DEFAULT_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "temperature": 0.2,
                },
            )
            if resp.status_code == 200:
                data = resp.json()
                answer_text = data["choices"][0]["message"]["content"]
            else:
                logger.warning("LiteLLM returned status %s: %s", resp.status_code, resp.text)
                answer_text = _generate_local_fallback_response(payload.query, context_data)
    except Exception as e:
        logger.warning("LiteLLM call error (%s). Generating structured local analytical response.", e)
        answer_text = _generate_local_fallback_response(payload.query, context_data)

    duration_ms = int((time.time() - start_time) * 1000)

    return AssistantQueryResponse(
        answer=answer_text,
        tool_calls=tools_executed,
        sources=[{"name": "Supervisor Database (PostgreSQL)", "verified": True}],
        suggested_questions=[
            "Quelles sont les alertes actives ?",
            "Quelle est la consommation IA de la semaine ?",
            "Quelles applications ont le plus d'activité aujourd'hui ?",
        ],
        execution_time_ms=duration_ms,
    )


def _generate_local_fallback_response(query: str, data: Dict[str, Any]) -> str:
    """Deterministic analytical fallback if LiteLLM gateway is unreachable."""
    lines = ["**Rapport de supervision généré :**\n"]
    if "user_activity" in data:
        ua = data["user_activity"]
        lines.append(f"- **Utilisateur `{ua['user_sub']}`** : {len(ua['recent_events'])} actions récentes répertoriées.")
        for ev in ua["recent_events"][:5]:
            lines.append(f"  • `{ev['time'][:16]}` | **{ev['app']}** | `{ev['type']}` ({ev['outcome']})")
    if "login_stats" in data:
        ls = data["login_stats"]
        lines.append(f"- **Connexions (dernières {ls['period_hours']}h)** : {ls['unique_users_connected']} utilisateurs uniques, {ls['successful_logins']} réussies, {ls['failed_logins']} échecs.")
    if "top_apps" in data:
        lines.append("- **Applications les plus actives** :")
        for app in data["top_apps"]["top_applications"]:
            lines.append(f"  • **{app['app']}** : {app['events']} événements enregistrés")
    if "ai_consumption" in data:
        ai = data["ai_consumption"]
        lines.append(f"- **Consommation IA (7 jours)** : {ai['total_tokens']:,} tokens consommés (~{ai['estimated_cost_usd']} $ USD).")
    if "active_alerts" in data:
        al = data["active_alerts"]
        lines.append(f"- **Alertes actives ({al['active_alerts_count']})** :")
        for a in al["alerts"]:
            lines.append(f"  • [{a['severity'].upper()}] {a['title']} ({a['app']}) - {a['count']} occurrences")
    return "\n".join(lines)
