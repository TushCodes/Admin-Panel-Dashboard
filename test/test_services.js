import assert from 'node:assert/strict';
import test from 'node:test';

import { createExcelWorkbook, createMisPdfReport } from '../services/index.js';

test('createMisPdfReport returns a PDF buffer with report content', () => {
  const pdf = createMisPdfReport({
    title: 'Daily MIS',
    generatedAt: new Date('2026-06-11T00:00:00.000Z'),
    columns: ['Metric', 'Value'],
    rows: [{ Metric: 'Leads', Value: 12 }],
  });

  assert.ok(Buffer.isBuffer(pdf));
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  assert.match(pdf.toString('latin1'), /Daily MIS/);
  assert.match(pdf.toString('latin1'), /Leads \| 12/);
});

test('createExcelWorkbook returns an xlsx workbook package', () => {
  const workbook = createExcelWorkbook({
    sheetName: 'MIS',
    columns: ['Metric', 'Value'],
    rows: [{ Metric: 'Revenue', Value: 2500 }],
  });

  assert.ok(Buffer.isBuffer(workbook));
  assert.equal(workbook.subarray(0, 4).toString('hex'), '504b0304');
  const content = workbook.toString('utf8');
  assert.match(content, /xl\/worksheets\/sheet1.xml/);
  assert.match(content, /Revenue/);
  assert.match(content, /2500/);
});
