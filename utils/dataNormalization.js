export class DataNormalizer {
  static normalizeForJson(value) {
    if (value instanceof Date) return DataNormalizer.normalizeDateOnly(value);
    if (typeof value === 'bigint') return value.toString();
    if (Array.isArray(value)) return value.map((item) => DataNormalizer.normalizeForJson(item));
    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, val]) => [key, DataNormalizer.normalizeForJson(val)]),
      );
    }
    return value;
  }

  static normalizeDateOnly(value) {
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
  }

  static normalizeStringList(values) {
    if (!Array.isArray(values)) return [];
    return values.map((value) => String(value).trim()).filter(Boolean);
  }

  static normalizeDelimitedStringList(value, delimiter = ',') {
    const values = Array.isArray(value) ? value : String(value ?? '').split(delimiter);
    return DataNormalizer.normalizeStringList(values);
  }
}

export function normalizeForJson(value) {
  return DataNormalizer.normalizeForJson(value);
}

export function normalizeDateOnly(value) {
  return DataNormalizer.normalizeDateOnly(value);
}

export function normalizeStringList(values) {
  return DataNormalizer.normalizeStringList(values);
}

export function normalizeDelimitedStringList(value, delimiter = ',') {
  return DataNormalizer.normalizeDelimitedStringList(value, delimiter);
}