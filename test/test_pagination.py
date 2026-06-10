"""Tests for pagination utilities."""

from __future__ import annotations

import unittest

from utils.error_handling import BadRequestError
from utils.pagination import paginate_items, parse_filters, parse_page, parse_sort
from utils.pagination.response import meta, page_response


class PaginationTest(unittest.TestCase):
    """Validate pagination, filters, sorting, and response helpers."""

    def test_parse_page_uses_defaults_and_bounds(self) -> None:
        page = parse_page({})

        self.assertEqual(page.page, 1)
        self.assertEqual(page.size, 20)
        self.assertEqual(page.offset, 0)

        with self.assertRaises(BadRequestError):
            parse_page({"page": "0"})

    def test_parse_filters_and_sort(self) -> None:
        filters = parse_filters({"filter_status": "open", "filter_count__gte": 2})
        sort = parse_sort({"sort": "-created_at,name"})

        self.assertEqual(filters[0].field, "status")
        self.assertEqual(filters[0].op, "eq")
        self.assertEqual(filters[1].op, "gte")
        self.assertTrue(sort[0].desc)
        self.assertEqual(sort[1].field, "name")

    def test_paginate_items_filters_sorts_and_slices(self) -> None:
        items = [
            {"id": 1, "status": "open", "name": "Beta"},
            {"id": 2, "status": "closed", "name": "Alpha"},
            {"id": 3, "status": "open", "name": "Gamma"},
        ]

        res = paginate_items(
            items,
            {"page": 1, "size": 1, "filter_status": "open", "sort": "name"},
        )

        self.assertEqual(res["items"], [{"id": 1, "status": "open", "name": "Beta"}])
        self.assertEqual(res["pagination"]["total"], 2)
        self.assertTrue(res["pagination"]["has_next"])

    def test_response_helpers(self) -> None:
        self.assertEqual(
            meta(page=2, size=10, total=25),
            {"page": 2, "size": 10, "total": 25, "pages": 3, "has_next": True, "has_prev": True},
        )
        self.assertEqual(page_response([1, 2], total=2)["items"], [1, 2])


if __name__ == "__main__":
    unittest.main()
