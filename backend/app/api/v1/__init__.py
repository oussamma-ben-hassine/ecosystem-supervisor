from fastapi import APIRouter
from app.api.v1.ingestion import router as ingestion_router
from app.api.v1.applications import router as applications_router
from app.api.v1.users import router as users_router
from app.api.v1.events import router as events_router
from app.api.v1.data import router as data_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.assistant import router as assistant_router
from app.api.v1.auth import router as auth_router
from app.api.v1.stream import router as stream_router

api_v1_router = APIRouter()

api_v1_router.include_router(ingestion_router)
api_v1_router.include_router(applications_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(events_router)
api_v1_router.include_router(data_router)
api_v1_router.include_router(analytics_router)
api_v1_router.include_router(alerts_router)
api_v1_router.include_router(assistant_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(stream_router)
