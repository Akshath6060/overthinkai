from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, ConfigDict


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def iso(value: datetime | None) -> str | None:
    return value.astimezone(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z") if value else None


class APIModel(BaseModel):
    model_config = ConfigDict(alias_generator=lambda s: s.split("_")[0] + "".join(p.title() for p in s.split("_")[1:]), populate_by_name=True, extra="forbid")


class ErrorBody(APIModel):
    code: str
    message: str
    request_id: str
    details: Any = {}


class ErrorEnvelope(APIModel):
    error: ErrorBody

