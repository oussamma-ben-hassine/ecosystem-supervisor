import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.redis import init_redis, close_redis
from app.db.init_db import init_models, seed_data
from app.api.v1 import api_v1_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("supervisor")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Ecosystem Supervisor Backend v%s...", settings.VERSION)
    try:
        await init_models()
        await seed_data()
    except Exception as e:
        logger.error("Database initialization warning: %s", e)

    try:
        await init_redis()
    except Exception as e:
        logger.warning("Redis initialization warning: %s", e)

    yield

    logger.info("Shutting down Ecosystem Supervisor Backend...")
    try:
        await close_redis()
    except Exception:
        pass


app = FastAPI(
    title="Ecosystem Supervisor API",
    description=(
        "Centralized supervision API for the oussamma.tn ecosystem.\n"
        "- Activity 360° telemetry\n"
        "- High-throughput event ingestion with Redis Streams & Outbox\n"
        "- AI LiteLLM monitoring\n"
        "- Security alerts & anomaly detection\n"
        "- OIDC SSO integration"
    ),
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
async def health_check():
    """Liveness probe."""
    return {
        "status": "healthy",
        "service": "ecosystem-supervisor-backend",
        "version": settings.VERSION,
    }


@app.get("/ready", tags=["Health"])
async def readiness_check():
    """Readiness probe."""
    return {
        "status": "ready",
        "database": "connected",
        "redis": "connected",
    }
