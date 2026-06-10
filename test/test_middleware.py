"""Tests for framework-neutral middleware."""

from __future__ import annotations

import unittest

from middleware import ApiMw, LoginMw, LoginRateMw, RateStore, init_mw


class MiddlewareTest(unittest.TestCase):
    """Validate middleware behavior without a specific web framework."""

    def test_api_middleware_wraps_response(self) -> None:
        app = ApiMw(lambda req: {"id": 1})

        payload, code = app({"path": "/leads"})

        self.assertEqual(code, 200)
        self.assertEqual(payload, {"success": True, "message": "OK", "data": {"id": 1}})

    def test_login_middleware_requires_token(self) -> None:
        app = ApiMw(LoginMw(lambda req: {"ok": True}, token="secret"))

        payload, code = app({"path": "/admin", "headers": {}})

        self.assertEqual(code, 401)
        self.assertEqual(payload["error"]["code"], "unauthorized")

    def test_login_middleware_accepts_bearer_token(self) -> None:
        app = ApiMw(LoginMw(lambda req: {"ok": True}, token="secret"))

        payload, code = app(
            {"path": "/admin", "headers": {"Authorization": "Bearer secret"}}
        )

        self.assertEqual(code, 200)
        self.assertEqual(payload["data"], {"ok": True})

    def test_login_rate_middleware_limits_login_posts(self) -> None:
        now = [100.0]
        store = RateStore(clock=lambda: now[0])
        app = ApiMw(LoginRateMw(lambda req: {"ok": True}, limit=2, window=60, store=store))
        req = {"path": "/login", "method": "POST", "client_ip": "127.0.0.1"}

        self.assertEqual(app(req)[1], 200)
        self.assertEqual(app(req)[1], 200)
        payload, code = app(req)

        self.assertEqual(code, 429)
        self.assertEqual(payload["error"]["code"], "too_many_requests")

    def test_init_mw_composes_stack(self) -> None:
        app = init_mw(
            lambda req: {"ok": True},
            auth={"token": "secret"},
            rate={"limit": 1},
        )

        payload, code = app(
            {"path": "/admin", "method": "GET", "headers": {"Authorization": "Bearer secret"}}
        )

        self.assertEqual(code, 200)
        self.assertEqual(payload["data"], {"ok": True})


if __name__ == "__main__":
    unittest.main()
