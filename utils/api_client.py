"""Small HTTP helpers for integrating external JSON APIs."""

from __future__ import annotations

from collections.abc import Callable, Mapping
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from model.api import APIConfig, APIRequest, APIResponse

from .error_handling import AppError
from .json import from_json, to_json
from .logging import get_logger

_API_LOGGER = get_logger("external_api")
UrlOpen = Callable[..., Any]


class ExternalAPIError(AppError):
    """Raised when an external API request cannot be completed successfully."""

    status_code = 502
    code = "external_api_error"


def build_api_url(config: APIConfig, request: APIRequest) -> str:
    """Build a request URL from API config, request path, and query values."""
    path = request.path if request.path.startswith("/") else f"/{request.path}"
    url = f"{config.normalized_base_url}{path}"
    if request.query:
        url = f"{url}?{urlencode(request.query, doseq=True)}"
    return url


def send_json_request(
    config: APIConfig,
    request: APIRequest,
    *,
    opener: UrlOpen = urlopen,
) -> APIResponse:
    """Send a JSON request and return a normalized API response.

    ``opener`` is injectable so tests or application code can provide a mock,
    retrying transport, or framework-specific HTTP client adapter later.
    """
    url = build_api_url(config, request)
    body = None
    headers = config.headers(request.headers)

    if request.json is not None:
        body = to_json(request.json).encode("utf-8")
        headers.setdefault("Content-Type", "application/json")

    http_request = Request(url, data=body, headers=headers, method=request.method)

    try:
        with opener(http_request, timeout=config.timeout_seconds) as response:
            return _response_from_http(response)
    except HTTPError as exc:
        error_response = _response_from_http(exc)
        raise ExternalAPIError(
            "External API returned an error response.",
            status_code=exc.code,
            details={"url": url, "response": error_response.data},
        ) from exc
    except URLError as exc:
        _API_LOGGER.warning("External API request failed: %s", exc.reason)
        raise ExternalAPIError(
            "External API could not be reached.",
            details={"url": url, "reason": str(exc.reason)},
        ) from exc


def _response_from_http(response: Any) -> APIResponse:
    """Convert urllib-style responses into the project response model."""
    raw_body = response.read()
    data = None
    if raw_body:
        data = from_json(raw_body)

    headers: Mapping[str, str]
    if hasattr(response, "headers"):
        headers = dict(response.headers.items())
    else:
        headers = {}

    status_code = getattr(response, "status", getattr(response, "code", 200))
    return APIResponse(status_code=status_code, data=data, headers=headers)
