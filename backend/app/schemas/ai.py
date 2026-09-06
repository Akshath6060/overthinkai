from pydantic import Field
from .common import APIModel


class AnalystOutput(APIModel):
    analysis: str = Field(min_length=1, max_length=5000)
    verdict: str = Field(min_length=1, max_length=100)
    confidence: int = Field(ge=0, le=100)


class JudgeOutput(APIModel):
    headline: str = Field(min_length=1, max_length=200)
    explanation: str = Field(min_length=1, max_length=5000)
    confidence: int = Field(ge=0, le=100)
    approve_count: int = Field(ge=0)
    disapprove_count: int = Field(ge=0)
    dissenting_agent_ids: list[str] = []
