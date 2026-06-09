"""Tests for the external API integration foundation."""

from __future__ import annotations

import io
import unittest
from urllib.error import HTTPError, URLError

from model.api import APIConfig, APIRequest, APIResponse
from utils.api_client import ExternalAPIError, build_api_url, send_json_request


class FakeHTTPResponse:
    """Minimal urllib-like response for client tests."""

    def __init__(
        self,
        *,
        body: bytes,
        status: int = 200,
        headers: dict[str, str] | None = None,
    ) -> None:
        self._body = body
        self.status = status
        self.headers = headers or {}

    def __enter__(self) -> "FakeHTTPResponse":
        return self

    def __exit__(self, exc_type: object, exc: object, traceback: object) -> None:
        return None

    def read(self) -> bytes:
        return self._body


class APIModelTest(unittest.TestCase):
    """Validate transport-neutral API models."""

    def test_config_merges_default_auth_and_request_headers(self) -> None:
        config = APIConfig(
            base_url="https://api.example.com/",
            default_headers={"X-App": "dashboard"},
            api_key="secret-token",
        )

        headers = config.headers({"X-Request": "lead-sync"})

        self.assertEqual(config.normalized_base_url, "https://api.example.com")
        self.assertEqual(headers["Accept"], "application/json")
        self.assertEqual(headers["X-App"], "dashboard")
        self.assertEqual(headers["Authorization"], "Bearer secret-token")
        self.assertEqual(headers["X-Request"], "lead-sync")

    def test_request_normalizes_method(self) -> None:
        request = APIRequest(method="post", path="/leads", json={"name": "Ada"})

        self.assertEqual(request.method, "POST")

    def test_response_ok_flags_success_statuses(self) -> None:
        self.assertTrue(APIResponse(status_code=204).ok)
        self.assertFalse(APIResponse(status_code=404).ok)


class APIClientTest(unittest.TestCase):
    """Validate reusable external API client helpers."""

    def test_build_api_url_includes_path_and_query(self) -> None:
        config = APIConfig(base_url="https://api.example.com/v1/")
        request = APIRequest(
            method="GET",
            path="consignments",
            query={"status": "open", "tag": ["a", "b"]},
        )

        self.assertEqual(
            build_api_url(config, request),
            "https://api.example.com/v1/consignments?status=open&tag=a&tag=b",
        )

    def test_send_json_request_posts_body_and_headers(self) -> None:
        captured: dict[str, object] = {}

        def opener(request: object, *, timeout: float) -> FakeHTTPResponse:
            captured["url"] = request.full_url
            captured["method"] = request.get_method()
            captured["body"] = request.data
            captured["content_type"] = request.headers["Content-type"]
            captured["timeout"] = timeout
            return FakeHTTPResponse(
                body=b'{"id":123}',
                status=201,
                headers={"X-Trace": "abc"},
            )

        config = APIConfig(base_url="https://api.example.com", timeout_seconds=3)
        request = APIRequest(method="POST", path="/leads", json={"name": "Ada"})

        response = send_json_request(config, request, opener=opener)

        self.assertEqual(captured["url"], "https://api.example.com/leads")
        self.assertEqual(captured["method"], "POST")
        self.assertEqual(captured["body"], b'{"name":"Ada"}')
        self.assertEqual(captured["content_type"], "application/json")
        self.assertEqual(captured["timeout"], 3)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data, {"id": 123})
        self.assertEqual(response.headers["X-Trace"], "abc")

    def test_send_json_request_raises_external_api_error_for_http_error(self) -> None:
        def opener(request: object, *, timeout: float) -> FakeHTTPResponse:
            raise HTTPError(
                request.full_url,
                400,
                "Bad Request",
                hdrs={},
                fp=io.BytesIO(b'{"message":"invalid"}'),
            )

        with self.assertRaises(ExternalAPIError) as ctx:
            send_json_request(
                APIConfig(base_url="https://api.example.com"),
                APIRequest(method="GET", path="/broken"),
                opener=opener,
            )

        self.assertEqual(ctx.exception.status_code, 400)
        self.assertEqual(ctx.exception.details["response"], {"message": "invalid"})

    def test_send_json_request_raises_external_api_error_for_network_error(self) -> None:
        def opener(request: object, *, timeout: float) -> FakeHTTPResponse:
            raise URLError("timed out")

        with self.assertRaises(ExternalAPIError) as ctx:
            send_json_request(
                APIConfig(base_url="https://api.example.com"),
                APIRequest(method="GET", path="/slow"),
                opener=opener,
            )

        self.assertEqual(ctx.exception.status_code, 502)
        self.assertEqual(ctx.exception.details["reason"], "timed out")


if __name__ == "__main__":
    unittest.main()
