from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class AssistantQueryRequest(BaseModel):
    query: str = Field(..., description="Natural language prompt, e.g. 'What did user X do today?'")
    conversation_id: Optional[str] = None
    target_user_id: Optional[str] = None
    timeframe: Optional[str] = "today"  # today, 7d, 30d, all


class AssistantToolCall(BaseModel):
    tool: str
    args: Dict[str, Any]
    result_summary: str


class AssistantQueryResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]] = []
    tool_calls: List[AssistantToolCall] = []
    suggested_questions: List[str] = []
    execution_time_ms: int = 0
