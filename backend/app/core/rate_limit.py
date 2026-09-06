import asyncio
import time
from collections import defaultdict, deque

from .errors import AppError


class ProcessRateLimiter:
    """Per-process sliding-window limiter. Replace with Redis for multiple workers."""

    def __init__(self):
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = asyncio.Lock()

    async def check(self, key: str, limit: int, window_seconds: int = 60) -> None:
        now = time.monotonic()
        async with self._lock:
            hits = self._hits[key]
            while hits and hits[0] <= now - window_seconds:
                hits.popleft()
            if len(hits) >= limit:
                retry_after = max(1, int(window_seconds - (now - hits[0])) + 1)
                raise AppError(429, "RATE_LIMITED", "Too many requests. Please reconsider more slowly.", headers={"Retry-After": str(retry_after)})
            hits.append(now)
