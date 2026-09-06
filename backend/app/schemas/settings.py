from typing import Literal
from .common import APIModel


class UserSettings(APIModel):
    theme: Literal["cream", "light", "dark"] = "cream"
    default_severity: Literal["NORMAL", "SEVERE", "EXISTENTIAL"] = "SEVERE"
    humor_level: Literal["Professional", "Dry", "Unhinged"] = "Dry"
    provider_mode: Literal["council"] = "council"
    stream_agent_output: bool = True
    verbose_activity_log: bool = True
    notify_on_complete: bool = False
    consensus_chime: bool = False
    auto_save: bool = True


class SettingsPatch(APIModel):
    theme: Literal["cream", "light", "dark"] | None = None
    default_severity: Literal["NORMAL", "SEVERE", "EXISTENTIAL"] | None = None
    humor_level: Literal["Professional", "Dry", "Unhinged"] | None = None
    provider_mode: Literal["council"] | None = None
    stream_agent_output: bool | None = None
    verbose_activity_log: bool | None = None
    notify_on_complete: bool | None = None
    consensus_chime: bool | None = None
    auto_save: bool | None = None

