from abc import ABC, abstractmethod
from typing import Any

from app.schemas.ai import AnalystOutput, JudgeOutput


class AIProvider(ABC):
    @abstractmethod
    async def analyze(self, question: str, agent: dict, severity: str, humor_level: str) -> tuple[AnalystOutput, dict]: ...

    @abstractmethod
    async def judge(self, question: str, agent: dict, results: list[dict], severity: str, humor_level: str) -> tuple[JudgeOutput, dict]: ...

