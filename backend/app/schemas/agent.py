from typing import Literal
from pydantic import Field
from .common import APIModel


class AgentCreate(APIModel):
    name: str = Field(min_length=1, max_length=80)
    emoji: str = Field(default="🧠", min_length=1, max_length=8)
    color: str = Field(default="#FFD84D", pattern=r"^#[0-9A-Fa-f]{6}$")
    tagline: str = Field(default="Custom overthinker", max_length=160)
    personality: str = Field(default="Opinionated but useful", max_length=500)
    instructions: str = Field(min_length=1, max_length=4000)
    role: Literal["analyst", "judge"] = "analyst"
    enabled: bool = True


class AgentPatch(APIModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    emoji: str | None = Field(default=None, min_length=1, max_length=8)
    color: str | None = Field(default=None, pattern=r"^#[0-9A-Fa-f]{6}$")
    tagline: str | None = Field(default=None, max_length=160)
    personality: str | None = Field(default=None, max_length=500)
    instructions: str | None = Field(default=None, min_length=1, max_length=4000)
    enabled: bool | None = None


class AgentOrder(APIModel):
    agent_ids: list[str] = Field(min_length=1, max_length=50)
