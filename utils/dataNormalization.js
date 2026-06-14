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

  static normalizeTableColumns(columns, fallbackColumns = []) {
    const normalizedColumns = DataNormalizer.normalizeStringList(columns);
    return normalizedColumns.length > 0 ? normalizedColumns : [...fallbackColumns];
  }

  static deriveTableColumns(columns, rows, fallbackColumns = []) {
    const normalizedColumns = DataNormalizer.normalizeTableColumns(columns);
    if (normalizedColumns.length > 0) return normalizedColumns;
    const firstObjectRow = Array.isArray(rows) ? rows.find((row) => row && !Array.isArray(row) && typeof row === 'object') : null;
    return firstObjectRow ? Object.keys(firstObjectRow) : [...fallbackColumns];
  }

  static normalizeTableRows(rows, columns, { output = 'object' } = {}) {
    if (!Array.isArray(rows)) return [];
    return rows.map((row) => {
      if (output === 'array') {
        if (Array.isArray(row)) return columns.map((_, index) => row[index] ?? '');
        return columns.map((column) => row?.[column] ?? '');
      }
      if (Array.isArray(row)) return Object.fromEntries(columns.map((column, index) => [column, row[index] ?? '']));
      return { ...row };
    });
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

export function normalizeTableColumns(columns, fallbackColumns = []) {
  return DataNormalizer.normalizeTableColumns(columns, fallbackColumns);
}

export function deriveTableColumns(columns, rows, fallbackColumns = []) {
  return DataNormalizer.deriveTableColumns(columns, rows, fallbackColumns);
}

export function normalizeTableRows(rows, columns, options = {}) {
  return DataNormalizer.normalizeTableRows(rows, columns, options);
}
