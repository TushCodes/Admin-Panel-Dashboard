"""Standard application error classes and exception-to-response handling."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from .logging import get_logger

_ERROR_LOGGER = get_logger("errors")


class AppError(Exception):
    """Base class for expected application errors.

    Args:
        message: Human-readable error message safe to return to clients.
        status_code: HTTP-style status code associated with the error.
        code: Stable machine-readable error code.
        details: Optional structured metadata for validation or domain errors.
    """

    status_code = 500
    code = "internal_server_error"

    def __init__(
        self,
        message: str = "An unexpected error occurred.",
        *,
        status_code: int | None = None,
        code: str | None = None,
        details: Mapping[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code or self.status_code
        self.code = code or self.code
        self.details = dict(details or {})

    def to_dict(self) -> dict[str, Any]:
        """Serialize the error into a client-safe response payload."""
        payload: dict[str, Any] = {
            "code": self.code,
            "message": self.message,
        }
        if self.details:
            payload["details"] = self.details
        return payload


class BadRequestError(AppError):
    """Raised when a request is malformed or cannot be parsed."""

    status_code = 400
    code = "bad_request"


class UnauthorizedError(AppError):
    """Raised when authentication is missing or invalid."""

    status_code = 401
    code = "unauthorized"


class ForbiddenError(AppError):
    """Raised when the authenticated user lacks permission."""

    status_code = 403
    code = "forbidden"


class NotFoundError(AppError):
    """Raised when a requested resource does not exist."""

    status_code = 404
    code = "not_found"


class ConflictError(AppError):
    """Raised when a request conflicts with current resource state."""

    status_code = 409
    code = "conflict"


class ValidationError(AppError):
    """Raised when syntactically valid input fails validation rules."""

    status_code = 422
    code = "validation_error"


class InternalServerError(AppError):
    """Raised for expected internal failures that should return HTTP 500."""

    status_code = 500
    code = "internal_server_error"


def handle_exception(
    exc: Exception,
    *,
    include_debug: bool = False,
) -> tuple[dict[str, Any], int]:
    """Convert any exception into a standardized error response.

    Expected ``AppError`` instances are returned with their configured status
    codes. Unexpected exceptions are logged with a traceback and hidden behind a
    generic ``internal_server_error`` response unless ``include_debug`` is true.
    """
    if isinstance(exc, AppError):
        payload = {"success": False, "error": exc.to_dict()}
        if exc.status_code >= 500:
            _ERROR_LOGGER.error(
                "Application error: %s",
                exc.message,
                exc_info=(type(exc), exc, exc.__traceback__),
            )
        else:
            _ERROR_LOGGER.warning("Request error: %s", exc.message)
        return payload, exc.status_code

    _ERROR_LOGGER.error(
        "Unhandled exception: %s",
        exc,
        exc_info=(type(exc), exc, exc.__traceback__),
    )
    error = InternalServerError()
    payload = {"success": False, "error": error.to_dict()}
    if include_debug:
        payload["error"]["details"] = {"exception": exc.__class__.__name__, "message": str(exc)}
    return payload, error.status_code
