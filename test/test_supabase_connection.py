"""Tests for the Supabase PostgreSQL connection helpers.

The live connection check is intentionally skipped unless a Supabase database URL
is provided through the same environment variables used by the application.
"""
from __future__ import annotations

import os
import unittest

from sqlalchemy import text

from db import connection


class SupabaseConnectionConfigurationTest(unittest.TestCase):
    """Validate Supabase database URL configuration behavior."""

    def setUp(self) -> None:
        self._orig_env = {
            name: os.environ.get(name)
            for name in connection.DATABASE_URL_ENV_NAMES
        }
        for name in connection.DATABASE_URL_ENV_NAMES:
            os.environ.pop(name, None)
        connection.get_engine.cache_clear()

    def tearDown(self) -> None:
        connection.close_db()
        for name, value in self._orig_env.items():
            if value is None:
                os.environ.pop(name, None)
            else:
                os.environ[name] = value

    def test_supabase_db_url_is_normalized_for_psycopg_driver(self) -> None:
        """Plain PostgreSQL URLs are normalized to SQLAlchemy's psycopg driver."""
        os.environ["SUPABASE_DB_URL"] = (
            "postgresql://postgres:secret@db.example.supabase.co:5432/postgres"
        )

        url = connection.get_database_url()

        self.assertEqual(
            url,
            "postgresql+psycopg://postgres:secret@db.example.supabase.co:5432/postgres",
        )

    def test_missing_supabase_database_url_raises_helpful_error(self) -> None:
        """A clear error is raised when no supported connection URL is set."""
        with self.assertRaisesRegex(RuntimeError, "DATABASE_URL or SUPABASE_DB_URL"):
            connection.get_database_url()


@unittest.skipUnless(
    any(os.getenv(env_name) for env_name in connection.DATABASE_URL_ENV_NAMES),
    "Set DATABASE_URL or SUPABASE_DB_URL to run the live Supabase connection test.",
)
class SupabaseConnectionIntegrationTest(unittest.TestCase):
    """Live Supabase connectivity test."""

    def tearDown(self) -> None:
        connection.close_db()

    def test_supabase_connection_executes_select_one(self) -> None:
        """The configured Supabase database accepts a simple SQL round trip."""
        with connection.db_session() as session:
            val = session.execute(text("SELECT 1")).scalar_one()

        self.assertEqual(val, 1)


if __name__ == "__main__":
    unittest.main()
