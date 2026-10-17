import asyncio
import hashlib
import logging
from datetime import datetime, timedelta
import random
from sqlalchemy import select, delete
from app.core.database import engine, Base, AsyncSessionLocal
from app.core.security import hash_api_key
from app.models import (
    Application,
    AppCredential,
    User,
    UserAppAccess,
    ActivityEvent,
    AuthEvent,
    Resource,
    DataEvent,
    AIUsageEvent,
    AlertRule,
    Alert,
    RetentionPolicy,
)

logger = logging.getLogger(__name__)

DEFAULT_APPS = [
    {
        "id": "sso",
        "name": "SSO Authenticator",
        "code": "sso",
        "description": "Central identity provider & OIDC OAuth2 gateway",
        "fqdn": "https://sso-a.oussamma.tn",
        "icon": "ShieldCheck",
        "key": "es_sso_sec_9941a87b649d8820c751e129ad89b",
    },
    {
        "id": "drive",
        "name": "ByteVault Drive",
        "code": "drive",
        "description": "Secure file storage, sharing & large asset transfers",
        "fqdn": "https://drive.oussamma.tn",
        "icon": "HardDrive",
        "key": "es_drive_sec_1054a88bc32d7718c892a101ee77b",
    },
    {
        "id": "messenger",
        "name": "Smart Messenger",
        "code": "messenger",
        "description": "E2EE smart messaging, calls & collaboration",
        "fqdn": "https://messenger.oussamma.tn",
        "icon": "MessageSquare",
        "key": "es_messenger_sec_4410a88cc11f9920d991b101dd88c",
    },
    {
        "id": "cv-builder",
        "name": "AI CV Builder",
        "code": "cv-builder",
        "description": "AI resume crafting, ATS optimization & PDF exports",
        "fqdn": "https://cv.oussamma.tn",
        "icon": "FileText",
        "key": "es_cvbuilder_sec_7720b99de22a8830e882c202aa99d",
    },
    {
        "id": "litellm",
        "name": "LiteLLM AI Gateway",
        "code": "litellm",
        "description": "Central LLM provider (Gemini, Claude, GPT, Mistral)",
        "fqdn": "https://ai.oussamma.tn",
        "icon": "Cpu",
        "key": "es_litellm_sec_8830c11ef33b9940f993d303bb11e",
    },
    {
        "id": "portal",
        "name": "Oussamma.tn Portal",
        "code": "portal",
        "description": "Ecosystem dashboard & unified application launcher",
        "fqdn": "https://oussamma.tn",
        "icon": "LayoutGrid",
        "key": "es_portal_sec_3340d22fa44c0050a004e404cc22f",
    },
    {
        "id": "recettes",
        "name": "Recettes & Halal Planner",
        "code": "recettes",
        "description": "Tunisian & Halal recipes with AI nutrition assistant",
        "fqdn": "https://recettes.oussamma.tn",
        "icon": "Utensils",
        "key": "es_recettes_sec_5560e33ab55d1160b115f505dd33a",
    },
    {
        "id": "notes",
        "name": "Ecosystem Notes",
        "code": "notes",
        "description": "Markdown & collaborative knowledge base",
        "fqdn": "https://notes.oussamma.tn",
        "icon": "BookOpen",
        "key": "es_notes_sec_6670f44bc66e2270c226a606ee44b",
    },
    {
        "id": "devspace",
        "name": "DevSpace Cloud IDE",
        "code": "devspace",
        "description": "Browser code editor & developer workspace",
        "fqdn": "https://devspace.oussamma.tn",
        "icon": "Code",
        "key": "es_devspace_sec_7780a55cd77f3380d337b707ff55c",
    },
    {
        "id": "tv-player",
        "name": "IPTV Stream Player",
        "code": "tv-player",
        "description": "Live TV and media streaming application",
        "fqdn": "https://tv.oussamma.tn",
        "icon": "Tv",
        "key": "es_tvplayer_sec_8890b66de88a4490e448c808aa66d",
    },
]


async def init_models():
    """Create all tables in PostgreSQL."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database schema created successfully.")


async def seed_data():
    """Populate default apps, API keys, alert rules, and sample user telemetry."""
    async with AsyncSessionLocal() as db:
        try:
            # 1. Seed applications & API keys
            for app_meta in DEFAULT_APPS:
                app_id = app_meta["id"]
                stmt = select(Application).where(Application.id == app_id)
                res = await db.execute(stmt)
                existing_app = res.scalar_one_or_none()

                if not existing_app:
                    new_app = Application(
                        id=app_id,
                        code=app_meta["code"],
                        name=app_meta["name"],
                        description=app_meta["description"],
                        fqdn=app_meta["fqdn"],
                        icon=app_meta["icon"],
                        is_active=True,
                        integration_status="active",
                    )
                    db.add(new_app)
                    await db.flush()

                    # Add API Key Credential
                    raw_key = app_meta["key"]
                    key_hash = hash_api_key(raw_key)
                    cred = AppCredential(
                        application_id=app_id,
                        key_prefix=raw_key[:12],
                        key_hash=key_hash,
                        description=f"Primary server ingestion key for {app_meta['name']}",
                        is_active=True,
                        scopes=["events:write", "ai:report", "users:identify"],
                    )
                    db.add(cred)

            # 2. Seed Default Alert Rules
            default_rules = [
                {
                    "id": "rule_failed_logins",
                    "name": "Multiple Failed Login Attempts",
                    "rule_type": "failed_logins",
                    "severity": "critical",
                    "threshold": 3,
                    "window_seconds": 300,
                    "description": "Triggers when 3 or more failed login attempts occur within 5 minutes.",
                },
                {
                    "id": "rule_mass_deletion",
                    "name": "Mass Resource Deletion",
                    "rule_type": "mass_deletion",
                    "severity": "critical",
                    "threshold": 5,
                    "window_seconds": 600,
                    "description": "Triggers when 5 or more resources are deleted in under 10 minutes.",
                },
                {
                    "id": "rule_high_downloads",
                    "name": "Abnormal Data Download Volume",
                    "rule_type": "high_downloads",
                    "severity": "warning",
                    "threshold": 10,
                    "window_seconds": 600,
                    "description": "Triggers when an actor downloads more than 10 files in 10 minutes.",
                },
                {
                    "id": "rule_error_spike",
                    "name": "Application Error Spike",
                    "rule_type": "error_spike",
                    "severity": "warning",
                    "threshold": 8,
                    "window_seconds": 300,
                    "description": "Triggers when error rate spikes across an application.",
                },
                {
                    "id": "rule_ai_token_spike",
                    "name": "Excessive AI Token Usage",
                    "rule_type": "ai_token_spike",
                    "severity": "warning",
                    "threshold": 50000,
                    "window_seconds": 3600,
                    "description": "Triggers when an application or user exceeds 50,000 tokens per hour.",
                },
            ]

            for r in default_rules:
                r_stmt = select(AlertRule).where(AlertRule.id == r["id"])
                r_res = await db.execute(r_stmt)
                if not r_res.scalar_one_or_none():
                    db.add(AlertRule(**r, is_enabled=True))

            # 3. Seed Retention Policies
            policies = [
                {"id": "retention_activity", "table_name": "activity_events", "retention_days": 365, "description": "1 year retention for audit logs"},
                {"id": "retention_auth", "table_name": "auth_events", "retention_days": 180, "description": "6 months retention for auth events"},
                {"id": "retention_ai", "table_name": "ai_usage_events", "retention_days": 90, "description": "90 days retention for AI telemetry"},
            ]
            for p in policies:
                p_stmt = select(RetentionPolicy).where(RetentionPolicy.id == p["id"])
                p_res = await db.execute(p_stmt)
                if not p_res.scalar_one_or_none():
                    db.add(RetentionPolicy(**p, is_active=1))

            # 4. Seed Primary Admin User (Oussamma)
            admin_stmt = select(User).where(User.sub == "user-oussamma-001")
            admin_res = await db.execute(admin_stmt)
            if not admin_res.scalar_one_or_none():
                admin_user = User(
                    id="https://sso-a.oussamma.tn:user-oussamma-001",
                    issuer="https://sso-a.oussamma.tn",
                    sub="user-oussamma-001",
                    email="oussammabenhassine@gmail.com",
                    name="Oussamma Ben Hassine",
                    avatar_url="https://lh3.googleusercontent.com/a/default-user",
                    role="admin",
                    is_active=True,
                    last_active_at=datetime.utcnow(),
                )
                db.add(admin_user)

                # Add UserAppAccess for all apps
                for app_meta in DEFAULT_APPS:
                    access = UserAppAccess(
                        user_id=admin_user.id,
                        application_id=app_meta["id"],
                        granted=True,
                        role="admin" if app_meta["id"] in ("sso", "portal") else "owner",
                        first_access_at=datetime.utcnow() - timedelta(days=30),
                        last_access_at=datetime.utcnow(),
                    )
                    db.add(access)

            # 5. Purge any demo or test users to ensure only real production values exist
            await db.execute(delete(User).where(User.sub.like("user-demo-%")))
            await db.execute(delete(UserAppAccess).where(UserAppAccess.user_id.like("%user-demo-%")))
            await db.execute(delete(ActivityEvent).where(ActivityEvent.actor_sub.like("user-demo-%")))
            await db.commit()
            logger.info("Database initialized with real production data only. Demo data purged.")

        except Exception as e:
            logger.error("Error seeding initial database: %s", e)
            await db.rollback()


async def main():
    await init_models()
    await seed_data()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
