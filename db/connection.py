"""Supabase PostgreSQL database connection utilities.

Set `DATABASE_URL` or `SUPABASE_DB_URL` to the Supabase PostgreSQL connection
string before using these helpers. Example formats accepted by SQLAlchemy:

- postgresql+psycopg://user:password@host:5432/postgres
- postgresql://user:password@host:5432/postgres

Do not commit real credentials. Keep project-specific connection details in an
environment file or deployment secret store.
"""

from __future__ import annotations

import os
from collections.abc import Generator
from functools import lru_cache

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

from model import Base

DATABASE_URL_ENV_NAMES = ("DATABASE_URL", "SUPABASE_DB_URL")


def _normalize_database_url(database_url: str) -> str:
    """Return a SQLAlchemy-compatible PostgreSQL URL.

    Supabase connection strings are sometimes copied as `postgresql://...`.
    SQLAlchemy can use that form when a default driver is installed, but this
    project pins the modern psycopg driver, so normalize to the explicit driver
    URL for consistent local and deployed behavior.
    """
    if database_url.startswith("postgresql://"):
        return database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    return database_url


def get_database_url() -> str:
    """Read the configured Supabase PostgreSQL connection URL.

    Raises:
        RuntimeError: If neither supported environment variable is configured.
    """
    for env_name in DATABASE_URL_ENV_NAMES:
        database_url = os.getenv(env_name)
        if database_url:
            return _normalize_database_url(database_url)

    supported_names = " or ".join(DATABASE_URL_ENV_NAMES)
    raise RuntimeError(
        f"Database connection is not configured. Set {supported_names} with "
        "your Supabase PostgreSQL connection string."
    )


@lru_cache(maxsize=1)
def get_engine() -> Engine:
    """Create and cache the SQLAlchemy engine for Supabase PostgreSQL."""
    return create_engine(
        get_database_url(),
        pool_pre_ping=True,
        pool_recycle=300,
        future=True,
    )


_session_factory = sessionmaker(
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
    future=True,
)


def SessionLocal() -> Session:
    """Create a SQLAlchemy session bound to the cached Supabase engine."""
    return _session_factory(bind=get_engine())


def get_db() -> Generator[Session, None, None]:
    """Yield a database session and always close it after use.

    This generator shape works well with dependency-injection frameworks and can
    also be used manually:

        db = next(get_db())
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def close_db() -> None:
    """Dispose the cached engine and reset it for the next connection attempt."""
    if get_engine.cache_info().currsize:
        get_engine().dispose()
        get_engine.cache_clear()


def init_db() -> None:
    """Create all SQLAlchemy tables on the configured Supabase database.

    Prefer Alembic migrations for production schema changes. This helper is a
    lightweight bootstrap option while the project is still being wired up.
    """
    Base.metadata.create_all(bind=get_engine())
