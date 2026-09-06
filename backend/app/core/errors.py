from typing import Any


class AppError(Exception):
    def __init__(self, status: int, code: str, message: str, details: Any = None, headers: dict[str, str] | None = None):
        self.status = status
        self.code = code
        self.message = message
        self.details = details or {}
        self.headers = headers or {}
        super().__init__(message)
