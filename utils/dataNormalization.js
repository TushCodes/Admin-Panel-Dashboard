export function normalizeForJson(value) {
  if (value instanceof Date) return normalizeDateOnly(value);
  if (typeof value === 'bigint') return value.toString();
  if (Array.isArray(value)) return value.map((item) => normalizeForJson(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, normalizeForJson(val)]),
    );
  }
  return value;
}

export function normalizeDateOnly(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

export function normalizeStringList(values) {
  if (!Array.isArray(values)) return [];
  return values.map((value) => String(value).trim()).filter(Boolean);
}

export function normalizeDelimitedStringList(value, delimiter = ',') {
  const values = Array.isArray(value) ? value : String(value ?? '').split(delimiter);
  return normalizeStringList(values);
}
