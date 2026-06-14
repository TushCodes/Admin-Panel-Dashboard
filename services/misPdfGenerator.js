import { normalizeDateOnly, normalizeTableColumns, normalizeTableRows } from '../utils/dataNormalization.js';
const DEFAULT_TITLE = 'MIS Report';
const DEFAULT_COLUMNS = ['Metric', 'Value'];

export function createMisPdfReport({ title = DEFAULT_TITLE, subtitle = null, columns = DEFAULT_COLUMNS, rows = [], generatedAt = new Date() } = {}) {
  const normalizedColumns = normalizeColumns(columns);
  const normalizedRows = normalizeRows(rows, normalizedColumns);
  const lines = [
    title,
    subtitle,
    `Generated: ${formatDateTime(generatedAt)}`,
    '',
    normalizedColumns.join(' | '),
    '-'.repeat(Math.max(normalizedColumns.join(' | ').length, 12)),
    ...normalizedRows.map((row) => normalizedColumns.map((column) => stringifyCell(row[column])).join(' | ')),
  ].filter((line) => line !== null && line !== undefined);

  return buildPdf(lines);
}

export async function saveMisPdfReport(filePath, options = {}, { writer = null } = {}) {
  const { writeFile } = writer ?? await import('node:fs/promises');
  const pdf = createMisPdfReport(options);
  await writeFile(filePath, pdf);
  return { filePath, bytes: pdf.length };
}

function normalizeColumns(columns) {
  return normalizeTableColumns(columns, DEFAULT_COLUMNS);
}

function normalizeRows(rows, columns) {
  return normalizeTableRows(rows, columns);
}

function buildPdf(lines) {
  const textCommands = lines.map((line, index) => `BT /F1 11 Tf 50 ${760 - index * 18} Td (${escapePdfText(line)}) Tj ET`).join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(textCommands)} >>\nstream\n${textCommands}\nendstream`,
  ];

  let body = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(body));
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(body);
  body += `xref\n0 ${objects.length + 1}\n`;
  body += '0000000000 65535 f \n';
  offsets.slice(1).forEach((offset) => { body += `${String(offset).padStart(10, '0')} 00000 n \n`; });
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(body, 'binary');
}

function escapePdfText(value) {
  return stringifyCell(value).replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)');
}

function stringifyCell(value) {
  if (value == null) return '';
  if (value instanceof Date) return formatDate(value);
  return String(value);
}

function formatDateTime(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function formatDate(value) {
  return normalizeDateOnly(value);
}
