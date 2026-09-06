from datetime import datetime
from typing import Any, Literal, TypedDict


class UserDocument(TypedDict):
    id: str
    displayName: str
    initials: str
    email: str | None
    guest: bool
    createdAt: datetime


class DecisionDocument(TypedDict):
    id: str
    userId: str
    runId: str
    question: str
    category: str
    severity: Literal["NORMAL", "SEVERE", "EXISTENTIAL"]
    saved: bool
    createdAt: datetime


class RunDocument(TypedDict):
    id: str
    userId: str
    decisionId: str
    status: Literal["queued", "running", "completed", "failed", "cancelled"]
    progress: int
    usage: dict[str, Any]
    metrics: dict[str, Any]


class EventDocument(TypedDict):
    id: str
    runId: str
    sequence: int
    type: str
    createdAt: datetime
    data: dict[str, Any]
