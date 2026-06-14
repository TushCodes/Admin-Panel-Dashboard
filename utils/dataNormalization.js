export class DataNormalizer {
  static normalizeForJson(value) {
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (typeof value === 'bigint') return value.toString();
    if (Array.isArray(value)) return value.map((item) => DataNormalizer.normalizeForJson(item));
    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, val]) => [key, DataNormalizer.normalizeForJson(val)]),
      );
    }
    return value;
  }
}

export function normalizeForJson(value) {
  return DataNormalizer.normalizeForJson(value);
}
