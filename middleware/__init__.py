"""Framework-neutral middleware exports and initialization helpers."""

from __future__ import annotations

from .api import ApiMw
from .auth import LoginMw
from .rate import LoginRateMw, RateStore, TooManyRequestsError


def init_mw(app, *, auth=None, rate=None, api: bool = True):
    """Wrap ``app`` with the project middleware stack.

    Middleware order is request-in/auth/rate first and response/error formatting
    last. ``auth`` and ``rate`` accept dictionaries passed to ``LoginMw`` and
    ``LoginRateMw`` respectively so framework adapters can configure paths and
    validation without coupling this package to a web framework.
    """
    wrapped = app
    if auth is not None:
        wrapped = LoginMw(wrapped, **auth)
    if rate is not None:
        wrapped = LoginRateMw(wrapped, **rate)
    if api:
        wrapped = ApiMw(wrapped)
    return wrapped


__all__ = [
    "ApiMw",
    "LoginMw",
    "LoginRateMw",
    "RateStore",
    "TooManyRequestsError",
    "init_mw",
]
