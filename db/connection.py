"""Supabase PostgreSQL database connection utilities.

The application reads ``DATABASE_URL`` and ``SECRET_KEY`` lazily only when a
database engine/session is created. These values are not stored in source code
and are passed directly to SQLAlchemy for the active database connection path.

Set ``DATABASE_URL`` before using these helpers. Example formats accepted by
SQLAlchemy:

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
from utils.db_error import ensure_database_connection_enabled

DATABASE_URL_ENV_NAMES = ("DATABASE_URL",)
SECRET_KEY_ENV_NAMES = ("SECRET_KEY",)


def _redacted_database_url(database_url: str) -> str:
    """Return the database URL with any password hidden for safe errors/logs."""
    try:
        url: URL = make_url(database_url)
    except Exception:
        return "<invalid database URL>"

    return str(url.set(password="***") if url.password else url)


def get_database_url() -> str:
    """Read the configured Supabase PostgreSQL connection URL.

    This keeps deployment secrets out of imports, module globals, and the
    repository while still propagating them to SQLAlchemy for the actual
    database connection.

    Raises:
        RuntimeError: If neither supported environment variable is configured.
    """
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        if database_url.startswith("postgresql://"):
            return database_url.replace("postgresql://", "postgresql+psycopg://", 1)
        return database_url

    raise RuntimeError("Set DATABASE_URL for the database connection.")


def get_secret_key() -> str:
    """Read the configured secret key from ``SECRET_KEY``."""
    secret_key = os.getenv("SECRET_KEY")
    if secret_key:
        return secret_key

    raise RuntimeError("Set SECRET_KEY for the secret key.")


@lru_cache(maxsize=1)
def get_engine() -> Engine:
    """Create and cache the SQLAlchemy engine for Supabase PostgreSQL."""
    ensure_database_connection_enabled()
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
