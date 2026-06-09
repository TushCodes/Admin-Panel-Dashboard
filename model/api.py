"""Transport-neutral models for external API integrations."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class APIConfig:
    """Connection settings shared by requests to one external API."""

    base_url: str
    default_headers: Mapping[str, str] = field(default_factory=dict)
    timeout_seconds: float = 10.0
    api_key: str | None = None
    api_key_header: str = "Authorization"
    api_key_prefix: str = "Bearer"

    def __post_init__(self) -> None:
        if not self.base_url or not self.base_url.strip():
            raise ValueError("base_url is required for external API integrations")
        if self.timeout_seconds <= 0:
            raise ValueError("timeout_seconds must be greater than zero")

    @property
    def normalized_base_url(self) -> str:
        """Return the configured base URL without a trailing slash."""
        return self.base_url.rstrip("/")

    def headers(self, extra_headers: Mapping[str, str] | None = None) -> dict[str, str]:
        """Merge default, authentication, and per-request headers."""
        headers = {"Accept": "application/json", **dict(self.default_headers)}
        if self.api_key:
            token = self.api_key
            if self.api_key_prefix:
                token = f"{self.api_key_prefix} {token}"
            headers[self.api_key_header] = token
        if extra_headers:
            headers.update(dict(extra_headers))
        return headers


@dataclass(frozen=True)
class APIRequest:
    """Simple request description that can be sent by any HTTP client."""

    method: str
    path: str
    query: Mapping[str, Any] | None = None
    headers: Mapping[str, str] | None = None
    json: Mapping[str, Any] | list[Any] | None = None

    def __post_init__(self) -> None:
        if not self.method or not self.method.strip():
            raise ValueError("method is required")
        if not self.path or not self.path.strip():
            raise ValueError("path is required")
        object.__setattr__(self, "method", self.method.upper())


@dataclass(frozen=True)
class APIResponse:
    """Normalized response returned by external API clients."""

    status_code: int
    data: Any = None
    headers: Mapping[str, str] = field(default_factory=dict)

    @property
    def ok(self) -> bool:
        """Return True when the response status code represents success."""
        return 200 <= self.status_code < 300
