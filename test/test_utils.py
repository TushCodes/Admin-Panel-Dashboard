"""Tests for shared utility helpers."""

from __future__ import annotations

import os
import unittest
from datetime import date

from utils.db_error import DatabaseConnectionDisabledError, ensure_database_connection_enabled
from utils.error_handling import BadRequestError, NotFoundError, handle_exception
from utils.json import json_response, parse_json_body, to_json
from utils.logging import get_logger


class JsonUtilsTest(unittest.TestCase):
    """Validate request and response JSON helpers."""

    def test_parse_json_body_accepts_object_payload(self) -> None:
        payload = parse_json_body(b'{"name":"Ada","active":true}')

        self.assertEqual(payload, {"name": "Ada", "active": True})

    def test_parse_json_body_rejects_invalid_json(self) -> None:
        with self.assertRaises(BadRequestError):
            parse_json_body('{"name":')

    def test_json_response_uses_standard_envelope(self) -> None:
        payload, status_code = json_response({"id": 1}, message="Created", status_code=201)

        self.assertEqual(status_code, 201)
        self.assertEqual(
            payload,
            {"success": True, "message": "Created", "data": {"id": 1}},
        )

    def test_to_json_serializes_dates(self) -> None:
        self.assertEqual(to_json({"created_on": date(2026, 6, 9)}), '{"created_on":"2026-06-09"}')


class ErrorHandlingUtilsTest(unittest.TestCase):
    """Validate standardized exception mapping."""

    def test_handle_exception_maps_app_error(self) -> None:
        payload, status_code = handle_exception(NotFoundError("Lead not found."))

        self.assertEqual(status_code, 404)
        self.assertEqual(
            payload,
            {
                "success": False,
                "error": {"code": "not_found", "message": "Lead not found."},
            },
        )

    def test_handle_exception_hides_unexpected_error_by_default(self) -> None:
        payload, status_code = handle_exception(ValueError("secret details"))

        self.assertEqual(status_code, 500)
        self.assertEqual(payload["error"]["code"], "internal_server_error")
        self.assertNotIn("details", payload["error"])


class LoggingUtilsTest(unittest.TestCase):
    """Validate project logger setup."""

    def test_get_logger_returns_namespaced_singleton(self) -> None:
        first_logger = get_logger("test")
        second_logger = get_logger("test")

        self.assertIs(first_logger, second_logger)
        self.assertEqual(first_logger.name, "admin_panel_dashboard.test")
        self.assertEqual(len(first_logger.handlers), 1)


class DatabaseErrorUtilsTest(unittest.TestCase):
    """Validate the database connection guard."""

    def setUp(self) -> None:
        self._orig_env = {
            name: os.environ.get(name)
            for name in ("DATABASE_URL", "SECRET_KEY")
        }
        for name in self._orig_env:
            os.environ.pop(name, None)

    def tearDown(self) -> None:
        for name, value in self._orig_env.items():
            if value is None:
                os.environ.pop(name, None)
            else:
                os.environ[name] = value

    def test_database_connection_disabled_raises(self) -> None:
        with self.assertRaises(DatabaseConnectionDisabledError):
            ensure_database_connection_enabled()


if __name__ == "__main__":
    unittest.main()
