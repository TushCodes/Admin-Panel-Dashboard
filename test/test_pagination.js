import assert from 'node:assert/strict';
import test from 'node:test';

import { BadRequestError } from '../utils/errorHandling.js';
import { paginateItems, parseFilters, parsePage, parseSort } from '../utils/pagination/index.js';
import { meta, pageResponse } from '../utils/pagination/response.js';

test('parsePage uses defaults and validates bounds', () => {
  const page = parsePage({});
  assert.equal(page.page, 1);
  assert.equal(page.size, 20);
  assert.equal(page.offset, 0);
  assert.throws(() => parsePage({ page: '0' }), BadRequestError);
});

test('parseFilters and parseSort parse query parameters', () => {
  const filters = parseFilters({ filter_status: 'open', filter_count__gte: 2 });
  const sort = parseSort({ sort: '-created_at,name' });
  assert.equal(filters[0].field, 'status');
  assert.equal(filters[0].op, 'eq');
  assert.equal(filters[1].op, 'gte');
  assert.equal(sort[0].desc, true);
  assert.equal(sort[1].field, 'name');
});

test('paginateItems filters, sorts, and slices arrays', () => {
  const items = [
    { id: 1, status: 'open', name: 'Beta' },
    { id: 2, status: 'closed', name: 'Alpha' },
    { id: 3, status: 'open', name: 'Gamma' },
  ];
  const result = paginateItems(items, { page: 1, size: 1, filter_status: 'open', sort: 'name' });
  assert.deepEqual(result.items, [{ id: 1, status: 'open', name: 'Beta' }]);
  assert.equal(result.pagination.total, 2);
  assert.equal(result.pagination.has_next, true);
});

test('pagination response helpers include metadata', () => {
  assert.deepEqual(meta({ page: 2, size: 10, total: 25 }), { page: 2, size: 10, total: 25, pages: 3, has_next: true, has_prev: true });
  assert.deepEqual(pageResponse([1, 2], { total: 2 }).items, [1, 2]);
});
