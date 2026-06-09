"""Supabase PostgreSQL database connection utilities.

The Render deployment should provide the real connection string through the
``DATABASE_URL`` environment variable. These helpers read that secret lazily only
when a database engine/session is created, then pass it directly to SQLAlchemy.

Set ``DATABASE_URL`` or ``SUPABASE_DB_URL`` before using these helpers. Example
formats accepted by SQLAlchemy:

- postgresql+psycopg://user:password@host:5432/postgres
- postgresql://user:password@host:5432/postgres

Do not commit real credentials. Keep project-specific connection details in an
environment file or deployment secret store.
"""

from __future__ import annotations

import os
from collections.abc import Generator, Iterator
from contextlib import contextmanager
from functools import lru_cache

from sqlalchemy import Engine, create_engine
from sqlalchemy.engine import URL, make_url
from sqlalchemy.orm import Session, sessionmaker

from model import Base

DATABASE_URL_ENV_NAMES = ("DATABASE_URL", "SUPABASE_DB_URL")


def _normalize_database_url(database_url: str) -> str:
    """Return a SQLAlchemy-compatible PostgreSQL URL.

    Supabase connection strings are sometimes copied as ``postgresql://...``.
    SQLAlchemy can use that form when a default driver is installed, but this
    project pins the modern psycopg driver, so normalize to the explicit driver
    URL for consistent local and deployed behavior.
    """
    if database_url.startswith("postgresql://"):
        return database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    return database_url


def _redacted_database_url(database_url: str) -> str:
    """Return the database URL with any password hidden for safe errors/logs."""
    try:
        url: URL = make_url(database_url)
    except Exception:
        return "<invalid database URL>"

    return str(url.set(password="***") if url.password else url)


def get_database_url() -> str:
    """Read the configured Supabase PostgreSQL connection URL.

    The URL is intentionally read from Render/local environment only at call
    time. This keeps deployment secrets out of imports, module globals, and the
    repository while still propagating them to SQLAlchemy for the actual
    database connection.

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
    database_url = get_database_url()
    try:
        return create_engine(
            database_url,
            pool_pre_ping=True,
            pool_recycle=300,
            future=True,
        )
    except Exception as exc:
        safe_url = _redacted_database_url(database_url)
        raise RuntimeError(f"Could not create database engine for {safe_url}.") from exc


_session_factory = sessionmaker(
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
    future=True,
)


def SessionLocal() -> Session:
    """Create a SQLAlchemy session bound to the cached Supabase engine."""
    return _session_factory(bind=get_engine())


@contextmanager
def db_session() -> Iterator[Session]:
    """Open a database session for one unit of work and close it afterward.

    Use this when code needs the Render-provided database environment only for
    the active connection scope:

        with db_session() as db:
            db.execute(...)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_db() -> Generator[Session, None, None]:
    """Yield a database session and always close it after use.

    This generator shape works well with dependency-injection frameworks and can
    also be used manually:

        db = next(get_db())
    """
    with db_session() as db:
        yield db


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
