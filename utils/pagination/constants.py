"""Pagination defaults and accepted query keys."""

from __future__ import annotations

DEFAULT_PAGE = 1
DEFAULT_SIZE = 20
MAX_SIZE = 100
PAGE_KEY = "page"
SIZE_KEY = "size"
SORT_KEY = "sort"
ORDER_KEY = "order"
FILTER_PREFIX = "filter_"
ASC = "asc"
DESC = "desc"
OPS = {"eq", "ne", "lt", "lte", "gt", "gte", "like", "in"}
