import { deriveTableColumns, normalizeDateOnly, normalizeTableRows } from '../utils/dataNormalization.js';
const DEFAULT_SHEET_NAME = 'Report';

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  return crc >>> 0;
});

export function createExcelWorkbook({ sheetName = DEFAULT_SHEET_NAME, columns = [], rows = [] } = {}) {
  const normalizedColumns = normalizeColumns(columns, rows);
  const normalizedRows = normalizeRows(rows, normalizedColumns);
  const worksheet = buildWorksheetXml(normalizedColumns, normalizedRows);
  return zipFiles({
    '[Content_Types].xml': contentTypesXml(),
    '_rels/.rels': rootRelationshipsXml(),
    'xl/workbook.xml': workbookXml(sheetName),
    'xl/_rels/workbook.xml.rels': workbookRelationshipsXml(),
    'xl/styles.xml': stylesXml(),
    'xl/worksheets/sheet1.xml': worksheet,
  });
}

export async function saveExcelWorkbook(filePath, options = {}, { writer = null } = {}) {
  const { writeFile } = writer ?? await import('node:fs/promises');
  const workbook = createExcelWorkbook(options);
  await writeFile(filePath, workbook);
  return { filePath, bytes: workbook.length };
}

function normalizeColumns(columns, rows) {
  return deriveTableColumns(columns, rows);
}

function normalizeRows(rows, columns) {
  return normalizeTableRows(rows, columns, { output: 'array' });
}

function buildWorksheetXml(columns, rows) {
  const allRows = [columns, ...rows];
  const rowXml = allRows.map((row, rowIndex) => {
    const cells = row.map((cell, columnIndex) => cellXml(cell, `${columnName(columnIndex + 1)}${rowIndex + 1}`)).join('');
    return `<row r="${rowIndex + 1}">${cells}</row>`;
  }).join('');
  return xml(`
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${rowXml}</sheetData>
</worksheet>`);
}

function cellXml(value, reference) {
  if (typeof value === 'number' && Number.isFinite(value)) return `<c r="${reference}"><v>${value}</v></c>`;
  if (value instanceof Date) return `<c r="${reference}" t="inlineStr"><is><t>${escapeXml(normalizeDateOnly(value))}</t></is></c>`;
  return `<c r="${reference}" t="inlineStr"><is><t>${escapeXml(value ?? '')}</t></is></c>`;
}

function columnName(index) {
  let name = '';
  let current = index;
  while (current > 0) {
    const remainder = (current - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    current = Math.floor((current - 1) / 26);
  }
  return name;
}

function zipFiles(files) {
  const localFileRecords = [];
  const centralDirectoryRecords = [];
  let offset = 0;

  Object.entries(files).forEach(([name, content]) => {
    const nameBuffer = Buffer.from(name);
    const data = Buffer.from(content);
    const crc = crc32(data);
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(data.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localFileRecords.push(localHeader, nameBuffer, data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(data.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralDirectoryRecords.push(centralHeader, nameBuffer);
    offset += localHeader.length + nameBuffer.length + data.length;
  });

  const centralDirectory = Buffer.concat(centralDirectoryRecords);
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4);
  endRecord.writeUInt16LE(0, 6);
  endRecord.writeUInt16LE(Object.keys(files).length, 8);
  endRecord.writeUInt16LE(Object.keys(files).length, 10);
  endRecord.writeUInt32LE(centralDirectory.length, 12);
  endRecord.writeUInt32LE(offset, 16);
  endRecord.writeUInt16LE(0, 20);
  return Buffer.concat([...localFileRecords, centralDirectory, endRecord]);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function workbookXml(sheetName) {
  return xml(`<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${escapeXml(sheetName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`);
}

function workbookRelationshipsXml() {
  return xml('<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
}

function rootRelationshipsXml() {
  return xml('<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
}

function contentTypesXml() {
  return xml('<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>');
}

function stylesXml() {
  return xml('<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs></styleSheet>');
}

function xml(body) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${body.trim()}`;
}

function escapeXml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}
