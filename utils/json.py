"""JSON helpers for request parsing and response payloads."""

from __future__ import annotations

import json as _json
from collections.abc import Mapping
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from .error_handling import AppError, BadRequestError


def _json_default(value: Any) -> str:
    """Serialize common API values that the JSON encoder does not handle."""
    if isinstance(value, datetime | date):
        return value.isoformat()
    if isinstance(value, Decimal):
        return str(value)
    raise TypeError(f"Object of type {value.__class__.__name__} is not JSON serializable")


def to_json(payload: Mapping[str, Any] | list[Any]) -> str:
    """Serialize a response payload to a compact JSON string."""
    return _json.dumps(payload, default=_json_default, separators=(",", ":"))


def from_json(raw_body: str | bytes | bytearray) -> Any:
    """Deserialize a raw JSON request body.

    Raises:
        BadRequestError: If the request body is empty, not UTF-8, or invalid JSON.
    """
    if isinstance(raw_body, bytes | bytearray):
        try:
            raw_body = raw_body.decode("utf-8")
        except UnicodeDecodeError as exc:
            raise BadRequestError("Request body must be valid UTF-8 JSON.") from exc

    if not raw_body or not raw_body.strip():
        raise BadRequestError("Request body cannot be empty.")

    try:
        return _json.loads(raw_body)
    except _json.JSONDecodeError as exc:
        raise BadRequestError(
            "Request body contains invalid JSON.",
            details={"line": exc.lineno, "column": exc.colno},
        ) from exc


def parse_json_body(
    raw_body: str | bytes | bytearray | Mapping[str, Any] | None,
    *,
    require_object: bool = True,
) -> dict[str, Any] | list[Any] | Any:
    """Parse and validate a JSON request body.

    ``Mapping`` values are accepted to support frameworks that have already
    parsed the body. By default, the parsed payload must be a JSON object because
    most API request handlers expect named fields.
    """
    if raw_body is None:
        raise BadRequestError("Request body cannot be empty.")

    parsed_body = dict(raw_body) if isinstance(raw_body, Mapping) else from_json(raw_body)
    if require_object and not isinstance(parsed_body, dict):
        raise BadRequestError("Request body must be a JSON object.")

    return parsed_body


def json_response(
    data: Any = None,
    *,
    message: str = "OK",
    status_code: int = 200,
    metadata: Mapping[str, Any] | None = None,
) -> tuple[dict[str, Any], int]:
    """Build a successful request-response payload.

    Returns a ``(payload, status_code)`` tuple that can be adapted easily by
    Flask, FastAPI, Django, or lightweight custom handlers.
    """
    payload: dict[str, Any] = {
        "success": True,
        "message": message,
        "data": data,
    }
    if metadata:
        payload["metadata"] = dict(metadata)
    return payload, status_code


def error_response(error: AppError) -> tuple[dict[str, Any], int]:
    """Build a standardized error response from an ``AppError``."""
    return {"success": False, "error": error.to_dict()}, error.status_code
