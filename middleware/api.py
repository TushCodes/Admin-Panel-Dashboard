"""API request/response middleware for normalized integrations."""

from __future__ import annotations

from collections.abc import Callable, Mapping
from typing import Any

from utils.error_handling import handle_exception
from utils.json import json_response

Handler = Callable[[Any], Any]


class ApiMw:
    """Normalize handler responses and convert exceptions to API payloads."""

    def __init__(self, app: Handler, *, debug: bool = False) -> None:
        self.app = app
        self.debug = debug

    def __call__(self, req: Any) -> tuple[dict[str, Any], int]:
        try:
            res = self.app(req)
        except Exception as exc:  # noqa: BLE001 - middleware boundary
            return handle_exception(exc, include_debug=self.debug)

        return self._wrap(res)

    def _wrap(self, res: Any) -> tuple[dict[str, Any], int]:
        if isinstance(res, tuple) and len(res) == 2:
            data, code = res
            if isinstance(data, Mapping) and "success" in data:
                return dict(data), int(code)
            return json_response(data, status_code=int(code))

        if isinstance(res, Mapping) and "success" in res:
            return dict(res), 200

        return json_response(res)
