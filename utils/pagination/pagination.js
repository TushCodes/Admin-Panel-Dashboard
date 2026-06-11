import { BadRequestError } from '../errorHandling.js';
import { ASC, DEFAULT_PAGE, DEFAULT_SIZE, DESC, FILTER_PREFIX, MAX_SIZE, OPS, ORDER_KEY, PAGE_KEY, SIZE_KEY, SORT_KEY } from './constants.js';
import { pageResponse } from './response.js';

export class Page {
  constructor({ page = DEFAULT_PAGE, size = DEFAULT_SIZE } = {}) { this.page = page; this.size = size; }
  get offset() { return (this.page - 1) * this.size; }
}
export class Filter { constructor({ field, op, val }) { this.field = field; this.op = op; this.val = val; } }
export class Sort { constructor({ field, desc = false }) { this.field = field; this.desc = desc; } }

export function parsePage(params = {}) {
  const page = parseInteger(params[PAGE_KEY] ?? DEFAULT_PAGE, PAGE_KEY);
  const size = parseInteger(params[SIZE_KEY] ?? DEFAULT_SIZE, SIZE_KEY);
  if (page < 1) throw new BadRequestError('page must be greater than zero');
  if (size < 1 || size > MAX_SIZE) throw new BadRequestError(`size must be between 1 and ${MAX_SIZE}`);
  return new Page({ page, size });
}

export function parseFilters(params = {}) {
  const items = [];
  for (const [key, val] of Object.entries(params ?? {})) {
    if (!key.startsWith(FILTER_PREFIX)) continue;
    const raw = key.slice(FILTER_PREFIX.length);
    const [field, opPart] = raw.split('__');
    const op = opPart || 'eq';
    if (!field || !OPS.has(op)) throw new BadRequestError('Invalid filter parameter.', { details: { filter: key } });
    items.push(new Filter({ field, op, val }));
  }
  return items;
}

export function parseSort(params = {}) {
  const raw = params?.[SORT_KEY];
  if (!raw) return [];
  const order = String(params[ORDER_KEY] ?? ASC).toLowerCase();
  if (![ASC, DESC].includes(order)) throw new BadRequestError('order must be asc or desc');
  const vals = Array.isArray(raw) ? raw : String(raw).split(',');
  return vals.filter((item) => String(item).trim()).map((item) => {
    const name = String(item).trim();
    const desc = name.startsWith('-') || order === DESC;
    const field = ['+', '-'].includes(name[0]) ? name.slice(1) : name;
    if (!field) throw new BadRequestError('Invalid sort field.');
    return new Sort({ field, desc });
  });
}

export function paginateItems(items, params = {}) {
  const pg = parsePage(params);
  let vals = applyFilters(items, parseFilters(params));
  vals = applySort(vals, parseSort(params));
  const total = vals.length;
  return pageResponse(vals.slice(pg.offset, pg.offset + pg.size), { page: pg.page, size: pg.size, total });
}

export function applyFilters(items, filters) {
  let vals = [...items];
  for (const filter of filters) vals = vals.filter((item) => match(valueOf(item, filter.field), filter.op, filter.val));
  return vals;
}

export function applySort(items, sorts) {
  const vals = [...items];
  [...sorts].reverse().forEach((rule) => {
    vals.sort((a, b) => compare(valueOf(a, rule.field), valueOf(b, rule.field)) * (rule.desc ? -1 : 1));
  });
  return vals;
}

export function applyQuery(query, model, params = {}) {
  return { query, model, page: parsePage(params), filters: parseFilters(params), sorts: parseSort(params) };
}

export function valueOf(item, field) { return item instanceof Map ? item.get(field) : item?.[field]; }
function parseInteger(val, name) { const parsed = Number.parseInt(val, 10); if (Number.isNaN(parsed)) throw new BadRequestError(`${name} must be an integer`); return parsed; }
function compare(left, right) { if (left === right) return 0; return left > right ? 1 : -1; }
function match(left, op, right) {
  if (op === 'eq') return left === right;
  if (op === 'ne') return left !== right;
  if (op === 'like') return String(left).toLowerCase().includes(String(right).toLowerCase());
  if (op === 'in') { const vals = Array.isArray(right) ? right : String(right).split(','); return vals.map(String).includes(String(left)); }
  if (op === 'lt') return left < right;
  if (op === 'lte') return left <= right;
  if (op === 'gt') return left > right;
  if (op === 'gte') return left >= right;
  return false;
}
