"""Tests for the Supabase PostgreSQL connection helpers.

The live connection check is intentionally skipped unless a Supabase database URL
is provided through the same environment variables used by the application.
"""
from __future__ import annotations

import os
import unittest

from sqlalchemy import text
from sqlalchemy.engine import URL

from db import connection
from utils.logging import get_logger


LOGGER = get_logger("db_test")


class SupabaseConnConfigTest(unittest.TestCase):
    """Validate Supabase database URL configuration behavior."""

    def setUp(self) -> None:
        self._orig_env = {
            name: os.environ.get(name)
            for name in connection.DATABASE_URL_ENV_NAMES
        }
        for name in self._orig_env:
            os.environ.pop(name, None)
        connection.get_engine.cache_clear()

    def tearDown(self) -> None:
        connection.close_db()
        for name, value in self._orig_env.items():
            if value is None:
                os.environ.pop(name, None)
            else:
                os.environ[name] = value

    def test_db_url_normalized(self) -> None:
        """Plain PostgreSQL URLs are normalized to SQLAlchemy's psycopg driver."""
        sample_url = URL.create(
            drivername="postgresql",
            username="postgres",
            password="secret",
            host="db.example.supabase.co",
            port=5432,
            database="postgres",
        )
        os.environ["DATABASE_URL"] = sample_url.render_as_string(hide_password=False)

        url = connection.get_database_url()

        self.assertEqual(
            url,
            sample_url.set(drivername="postgresql+psycopg").render_as_string(
                hide_password=False
            ),
        )

    def test_missing_db_url_raises(self) -> None:
        """A clear error is raised when no supported connection URL is set."""
        with self.assertRaisesRegex(RuntimeError, "DATABASE_URL"):
            connection.get_database_url()


@unittest.skipUnless(
    any(os.getenv(env_name) for env_name in connection.DATABASE_URL_ENV_NAMES)
    and any(os.getenv(env_name) for env_name in connection.SECRET_KEY_ENV_NAMES),
    "Set DATABASE_URL and SECRET_KEY to run the live Supabase connection test.",
)
class SupabaseConnLiveTest(unittest.TestCase):
    """Live Supabase connectivity test."""

    def tearDown(self) -> None:
        connection.close_db()

    def test_executes_select_one(self) -> None:
        """The configured Supabase database accepts a simple SQL round trip."""
        with connection.db_session() as session:
            val = session.execute(text("SELECT 1")).scalar_one()

        self.assertEqual(val, 1)
        LOGGER.info("Live database connection succeeded.")


if __name__ == "__main__":
    unittest.main()
