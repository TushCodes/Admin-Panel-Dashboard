"""Sort helper functions for paginated resources."""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Any

from utils.error_handling import BadRequestError

from .constants import ASC, DESC, ORDER_KEY, SORT_KEY
from .filters import get_val


@dataclass(frozen=True)
class Sort:
    """Parsed sort rule."""

    field: str
    desc: bool = False


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


def apply_sort(items: Sequence[Any], sorts: Sequence[Sort]) -> list[Any]:
    """Apply stable multi-column sorting to mappings or simple objects."""
    vals = list(items)
    for rule in reversed(sorts):
        vals.sort(key=lambda item, field=rule.field: get_val(item, field), reverse=rule.desc)
    return vals


def apply_query_sort(query: Any, model: Any, sorts: Sequence[Sort]) -> Any:
    """Apply parsed sort rules to a SQLAlchemy-style query."""
    for rule in sorts:
        if not hasattr(model, rule.field):
            raise BadRequestError("Invalid field.", details={"field": rule.field})
        col = getattr(model, rule.field)
        query = query.order_by(col.desc() if rule.desc else col.asc())
    return query
