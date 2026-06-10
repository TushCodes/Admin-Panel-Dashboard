"""Pagination, filtering, and sorting helpers."""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Any

from utils.error_handling import BadRequestError

from .constants import (
    ASC,
    DEFAULT_PAGE,
    DEFAULT_SIZE,
    DESC,
    FILTER_PREFIX,
    MAX_SIZE,
    OPS,
    ORDER_KEY,
    PAGE_KEY,
    SIZE_KEY,
    SORT_KEY,
)
from .response import page_response


@dataclass(frozen=True)
class Page:
    """Parsed page settings."""

    page: int = DEFAULT_PAGE
    size: int = DEFAULT_SIZE

    @property
    def offset(self) -> int:
        """Return the row offset for this page."""
        return (self.page - 1) * self.size


@dataclass(frozen=True)
class Filter:
    """Parsed field filter."""

    field: str
    op: str
    val: Any


@dataclass(frozen=True)
class Sort:
    """Parsed sort rule."""

    field: str
    desc: bool = False


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


def parse_filters(params: Mapping[str, Any] | None) -> list[Filter]:
    """Parse query keys like ``filter_status`` or ``filter_date__gte``."""
    items: list[Filter] = []
    for key, val in (params or {}).items():
        if not key.startswith(FILTER_PREFIX):
            continue
        raw = key[len(FILTER_PREFIX) :]
        field, _, op = raw.partition("__")
        op = op or "eq"
        if not field or op not in OPS:
            raise BadRequestError("Invalid filter parameter.", details={"filter": key})
        items.append(Filter(field=field, op=op, val=val))
    return items


def parse_sort(params: Mapping[str, Any] | None) -> list[Sort]:
    """Parse sort settings from ``sort`` and ``order`` query values."""
    src = params or {}
    raw = src.get(SORT_KEY)
    if not raw:
        return []
    order = str(src.get(ORDER_KEY, ASC)).lower()
    if order not in {ASC, DESC}:
        raise BadRequestError("order must be asc or desc")
    vals = raw if isinstance(raw, list | tuple) else str(raw).split(",")
    out: list[Sort] = []
    for item in vals:
        name = str(item).strip()
        if not name:
            continue
        desc = name.startswith("-") or order == DESC
        field = name[1:] if name[0] in "+-" else name
        if not field:
            raise BadRequestError("Invalid sort field.")
        out.append(Sort(field=field, desc=desc))
    return out


def paginate_items(items: Sequence[Any], params: Mapping[str, Any] | None = None) -> dict[str, Any]:
    """Filter, sort, and paginate a Python sequence."""
    pg = parse_page(params)
    vals = list(items)
    vals = apply_filters(vals, parse_filters(params))
    vals = apply_sort(vals, parse_sort(params))
    total = len(vals)
    chunk = vals[pg.offset : pg.offset + pg.size]
    return page_response(chunk, page=pg.page, size=pg.size, total=total)


def apply_filters(items: Sequence[Any], filters: Sequence[Filter]) -> list[Any]:
    """Apply parsed filters to mappings or simple objects."""
    vals = list(items)
    for flt in filters:
        vals = [item for item in vals if _match(_val(item, flt.field), flt.op, flt.val)]
    return vals


def apply_sort(items: Sequence[Any], sorts: Sequence[Sort]) -> list[Any]:
    """Apply stable multi-column sorting to mappings or simple objects."""
    vals = list(items)
    for rule in reversed(sorts):
        vals.sort(key=lambda item, field=rule.field: _val(item, field), reverse=rule.desc)
    return vals


def apply_query(query: Any, model: Any, params: Mapping[str, Any] | None = None) -> Any:
    """Apply filters, sorts, limit, and offset to a SQLAlchemy-style query."""
    pg = parse_page(params)
    for flt in parse_filters(params):
        col = _col(model, flt.field)
        query = query.filter(_expr(col, flt.op, flt.val))
    for rule in parse_sort(params):
        col = _col(model, rule.field)
        query = query.order_by(col.desc() if rule.desc else col.asc())
    return query.offset(pg.offset).limit(pg.size)


def _int(val: Any, name: str) -> int:
    try:
        return int(val)
    except (TypeError, ValueError) as exc:
        raise BadRequestError(f"{name} must be an integer") from exc


def _val(item: Any, field: str) -> Any:
    if isinstance(item, Mapping):
        return item.get(field)
    return getattr(item, field, None)


def _match(left: Any, op: str, right: Any) -> bool:
    if op == "eq":
        return left == right
    if op == "ne":
        return left != right
    if op == "like":
        return str(right).lower() in str(left).lower()
    if op == "in":
        vals = right if isinstance(right, list | tuple | set) else str(right).split(",")
        return str(left) in {str(item) for item in vals}
    return _cmp(left, op, right)


def _cmp(left: Any, op: str, right: Any) -> bool:
    if op == "lt":
        return left < right
    if op == "lte":
        return left <= right
    if op == "gt":
        return left > right
    if op == "gte":
        return left >= right
    return False


def _col(model: Any, field: str) -> Any:
    if not hasattr(model, field):
        raise BadRequestError("Invalid field.", details={"field": field})
    return getattr(model, field)


def _expr(col: Any, op: str, val: Any) -> Any:
    if op == "eq":
        return col == val
    if op == "ne":
        return col != val
    if op == "lt":
        return col < val
    if op == "lte":
        return col <= val
    if op == "gt":
        return col > val
    if op == "gte":
        return col >= val
    if op == "like":
        return col.ilike(f"%{val}%")
    vals = val if isinstance(val, list | tuple | set) else str(val).split(",")
    return col.in_(vals)
