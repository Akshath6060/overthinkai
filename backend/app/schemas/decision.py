from typing import Literal
from pydantic import Field, field_validator, model_validator
from .common import APIModel


Category = Literal["Food", "Career", "College", "Relationships", "Money", "Life", "Other"]
Severity = Literal["NORMAL", "SEVERE", "EXISTENTIAL"]


class DecisionCreate(APIModel):
    question: str = Field(min_length=3, max_length=2000)
    category: Category = "Other"
    severity: Severity = "SEVERE"
    humor_level: Literal["Professional", "Dry", "Unhinged"] = "Dry"
    provider_mode: Literal["council"] = "council"
    agent_ids: list[str] = Field(min_length=2, max_length=20)
    auto_save: bool = True

    @field_validator("question")
    @classmethod
    def trim_question(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 3:
            raise ValueError("Question must contain at least 3 non-whitespace characters")
        return value

    @model_validator(mode="after")
    def distinct_agents(self):
        if len(self.agent_ids) != len(set(self.agent_ids)):
            raise ValueError("agentIds must not contain duplicates")
        return self

