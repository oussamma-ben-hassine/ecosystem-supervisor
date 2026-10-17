from datetime import date
from sqlalchemy import Column, String, Date, Float, ForeignKey, Index, UniqueConstraint
from app.core.database import Base
from app.models.base import TimestampMixin


class DailyMetric(Base, TimestampMixin):
    __tablename__ = "daily_metrics"

    id = Column(String(100), primary_key=True)  # {metric_date}:{application_id}:{metric_name}
    metric_date = Column(Date, nullable=False, index=True)
    application_id = Column(String(50), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    metric_name = Column(String(100), nullable=False, index=True)  # dau, wau, mau, events_total, ai_tokens_total, ai_cost_usd, errors_total
    metric_value = Column(Float, default=0.0, nullable=False)

    __table_args__ = (
        UniqueConstraint("metric_date", "application_id", "metric_name", name="uq_daily_metric"),
        Index("ix_metric_date_name", "metric_date", "metric_name"),
    )
