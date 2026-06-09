"""Database connection guard and error types."""

from __future__ import annotations

import os

from .logging import get_logger

_DB_ERROR_LOGGER = get_logger("db")


class DatabaseConnectionDisabledError(RuntimeError):
    """Raised when the production database connection is not enabled."""


def is_database_connection_enabled() -> bool:
    """Return ``True`` when the production database settings are present."""
    return bool(os.getenv("DATABASE_URL") and os.getenv("SECRET_KEY"))


def ensure_database_connection_enabled() -> None:
    """Log and raise when the production database connection is disabled."""
    if is_database_connection_enabled():
        return

    _DB_ERROR_LOGGER.error(
        "Database connection is disabled because DATABASE_URL or SECRET_KEY is missing."
    )
    raise DatabaseConnectionDisabledError(
        "Database connection is disabled. Set DATABASE_URL and SECRET_KEY."
    )
