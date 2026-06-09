"""Reusable utility helpers for the Admin Panel Dashboard."""

from __future__ import annotations

from .error_handling import (
    AppError,
    BadRequestError,
    ConflictError,
    ForbiddenError,
    InternalServerError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
    handle_exception,
)
from .error import (
    DatabaseConnectionDisabledError,
    ensure_database_connection_enabled,
    is_database_connection_enabled,
)
from .json import error_response, json_response, parse_json_body
from .logging import get_logger

__all__ = [
    "AppError",
    "BadRequestError",
    "ConflictError",
    "DatabaseConnectionDisabledError",
    "ForbiddenError",
    "InternalServerError",
    "NotFoundError",
    "ensure_database_connection_enabled",
    "UnauthorizedError",
    "ValidationError",
    "error_response",
    "get_logger",
    "handle_exception",
    "is_database_connection_enabled",
    "json_response",
    "parse_json_body",
]
