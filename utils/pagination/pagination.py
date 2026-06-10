"""Pagination helper functions."""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Any

from utils.error_handling import BadRequestError

from .constants import DEFAULT_PAGE, DEFAULT_SIZE, MAX_SIZE, PAGE_KEY, SIZE_KEY
from .filters import apply_filters, apply_query_filters, parse_filters
from .response import page_response
from .sort import apply_query_sort, apply_sort, parse_sort


@dataclass(frozen=True)
class Page:
    """Parsed page settings."""

    page: int = DEFAULT_PAGE
    size: int = DEFAULT_SIZE

    @property
    def offset(self) -> int:
        """Return the row offset for this page."""
        return (self.page - 1) * self.size


def parse_page(params: Mapping[str, Any] | None) -> Page:
    """Parse and validate page/size values."""
    src = params or {}
    page = _int(src.get(PAGE_KEY, DEFAULT_PAGE), PAGE_KEY)
    size = _int(src.get(SIZE_KEY, DEFAULT_SIZE), SIZE_KEY)
    if page < 1:
        raise BadRequestError("page must be greater than zero")
    if size < 1 or size > MAX_SIZE:
        raise BadRequestError(f"size must be between 1 and {MAX_SIZE}")
    return Page(page=page, size=size)


def paginate_items(items: Sequence[Any], params: Mapping[str, Any] | None = None) -> dict[str, Any]:
    """Filter, sort, and paginate a Python sequence."""
    pg = parse_page(params)
    vals = list(items)
    vals = apply_filters(vals, parse_filters(params))
    vals = apply_sort(vals, parse_sort(params))
    total = len(vals)
    chunk = vals[pg.offset : pg.offset + pg.size]
    return page_response(chunk, page=pg.page, size=pg.size, total=total)


def apply_query(query: Any, model: Any, params: Mapping[str, Any] | None = None) -> Any:
    """Apply filters, sorts, limit, and offset to a SQLAlchemy-style query."""
    pg = parse_page(params)
    query = apply_query_filters(query, model, parse_filters(params))
    query = apply_query_sort(query, model, parse_sort(params))
    return query.offset(pg.offset).limit(pg.size)


def _int(val: Any, name: str) -> int:
    try:
        return int(val)
    except (TypeError, ValueError) as exc:
        raise BadRequestError(f"{name} must be an integer") from exc
