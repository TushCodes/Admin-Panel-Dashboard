import { DEFAULT_PAGE, DEFAULT_SIZE } from './constants.js';

export function meta({ page = DEFAULT_PAGE, size = DEFAULT_SIZE, total = 0 } = {}) {
  const pages = size ? Math.ceil(total / size) : 0;
  return { page, size, total, pages, has_next: page < pages, has_prev: page > 1 };
}

export function pageResponse(items, { page = DEFAULT_PAGE, size = DEFAULT_SIZE, total = null, extra = null } = {}) {
  const count = total ?? items.length;
  const response = { items: [...items], pagination: meta({ page, size, total: count }) };
  if (extra) Object.assign(response, extra);
  return response;
}
