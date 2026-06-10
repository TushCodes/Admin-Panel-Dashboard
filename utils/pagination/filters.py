"""Filter helper functions for paginated resources."""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Any

from utils.error_handling import BadRequestError

from .constants import FILTER_PREFIX, OPS


@dataclass(frozen=True)
class Filter:
    """Parsed field filter."""

    field: str
    op: str
    val: Any


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


def apply_filters(items: Sequence[Any], filters: Sequence[Filter]) -> list[Any]:
    """Apply parsed filters to mappings or simple objects."""
    vals = list(items)
    for flt in filters:
        vals = [item for item in vals if _match(_val(item, flt.field), flt.op, flt.val)]
    return vals


def apply_query_filters(query: Any, model: Any, filters: Sequence[Filter]) -> Any:
    """Apply parsed filters to a SQLAlchemy-style query."""
    for flt in filters:
        col = _col(model, flt.field)
        query = query.filter(_expr(col, flt.op, flt.val))
    return query


def get_val(item: Any, field: str) -> Any:
    """Read ``field`` from a mapping or simple object."""
    return _val(item, field)


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
