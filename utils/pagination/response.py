"""Response helpers for paginated payloads."""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from typing import Any

from .constants import DEFAULT_PAGE, DEFAULT_SIZE


def meta(page: int = DEFAULT_PAGE, size: int = DEFAULT_SIZE, total: int = 0) -> dict[str, int | bool]:
    """Build pagination metadata."""
    pages = (total + size - 1) // size if size else 0
    return {
        "page": page,
        "size": size,
        "total": total,
        "pages": pages,
        "has_next": page < pages,
        "has_prev": page > 1,
    }


def page_response(
    items: Sequence[Any],
    *,
    page: int = DEFAULT_PAGE,
    size: int = DEFAULT_SIZE,
    total: int | None = None,
    extra: Mapping[str, Any] | None = None,
) -> dict[str, Any]:
    """Build the standard data/metadata object for paged responses."""
    cnt = len(items) if total is None else total
    res: dict[str, Any] = {"items": list(items), "pagination": meta(page, size, cnt)}
    if extra:
        res.update(dict(extra))
    return res
