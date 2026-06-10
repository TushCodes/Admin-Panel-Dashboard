"""Login/authentication middleware."""

from __future__ import annotations

import hmac
from collections.abc import Callable, Iterable
from typing import Any

from utils.error_handling import UnauthorizedError

Handler = Callable[[Any], Any]
AuthFn = Callable[[str, Any], bool]


class LoginMw:
    """Require a valid login token for protected request paths."""

    def __init__(
        self,
        app: Handler,
        *,
        token: str | None = None,
        auth_fn: AuthFn | None = None,
        public: Iterable[str] = ("/login", "/health"),
    ) -> None:
        self.app = app
        self.token = token
        self.auth_fn = auth_fn
        self.public = tuple(public)

    def __call__(self, req: Any) -> Any:
        if self._is_public(req) or self._is_valid(req):
            return self.app(req)
        raise UnauthorizedError("Login is required.")

    def _is_public(self, req: Any) -> bool:
        path = _get(req, "path", "/") or "/"
        return any(path == item or path.startswith(f"{item.rstrip('/')}/") for item in self.public)

    def _is_valid(self, req: Any) -> bool:
        tok = _token(req)
        if not tok:
            return False
        if self.auth_fn:
            return bool(self.auth_fn(tok, req))
        if self.token:
            return hmac.compare_digest(tok, self.token)
        return False


def _token(req: Any) -> str | None:
    hdrs = _get(req, "headers", {}) or {}
    val = None
    if isinstance(hdrs, dict):
        val = hdrs.get("Authorization") or hdrs.get("authorization")
    if not val:
        return None
    kind, _, tok = str(val).partition(" ")
    if kind.lower() != "bearer" or not tok:
        return None
    return tok.strip()


def _get(obj: Any, key: str, default: Any = None) -> Any:
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)
