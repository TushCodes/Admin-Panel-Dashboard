"""In-memory rate limiting middleware for login endpoints."""

from __future__ import annotations

import time
from collections.abc import Callable, Iterable
from dataclasses import dataclass, field
from typing import Any

from utils.error_handling import AppError

Handler = Callable[[Any], Any]
Clock = Callable[[], float]


class TooManyRequestsError(AppError):
    """Raised when a caller exceeds a configured rate limit."""

    status_code = 429
    code = "too_many_requests"


@dataclass
class RateStore:
    """Small TTL counter store suitable for one-process deployments/tests."""

    clock: Clock = time.time
    hits: dict[str, list[float]] = field(default_factory=dict)

    def add(self, key: str, *, limit: int, window: int) -> tuple[bool, int]:
        now = self.clock()
        start = now - window
        vals = [ts for ts in self.hits.get(key, []) if ts > start]
        ok = len(vals) < limit
        if ok:
            vals.append(now)
        self.hits[key] = vals
        return ok, max(limit - len(vals), 0)


class LoginRateMw:
    """Limit repeated login attempts by client key."""

    def __init__(
        self,
        app: Handler,
        *,
        limit: int = 5,
        window: int = 60,
        paths: Iterable[str] = ("/login",),
        store: RateStore | None = None,
    ) -> None:
        self.app = app
        self.limit = limit
        self.window = window
        self.paths = tuple(paths)
        self.store = store or RateStore()

    def __call__(self, req: Any) -> Any:
        if self._matches(req):
            ok, left = self.store.add(self._key(req), limit=self.limit, window=self.window)
            if not ok:
                raise TooManyRequestsError(
                    "Too many login attempts. Please try again later.",
                    details={"retry_after": self.window, "remaining": left},
                )
        return self.app(req)

    def _matches(self, req: Any) -> bool:
        path = _get(req, "path", "/") or "/"
        method = (_get(req, "method", "GET") or "GET").upper()
        return method == "POST" and any(path == item for item in self.paths)

    def _key(self, req: Any) -> str:
        hdrs = _get(req, "headers", {}) or {}
        ip = _get(req, "client_ip") or _get(req, "ip")
        if not ip and isinstance(hdrs, dict):
            ip = hdrs.get("X-Forwarded-For", "").split(",")[0].strip()
        return str(ip or "anonymous")


def _get(obj: Any, key: str, default: Any = None) -> Any:
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)
