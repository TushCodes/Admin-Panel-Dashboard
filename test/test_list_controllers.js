import assert from 'node:assert/strict';
import test from 'node:test';

import { createArchivedController } from '../controllers/archived.js';
import { createConsignmentController } from '../controllers/consignments.js';
import { createDocumentController } from '../controllers/documents.js';
import { createLeadController } from '../controllers/leads.js';

function createResponse() {
  return {
    payload: null,
    json(payload) { this.payload = payload; return this; },
  };
}

function createDelegate(items = []) {
  const calls = [];
  return {
    calls,
    async findMany(args) {
      calls.push(args);
      return items;
    },
  };
}

test('list controllers keep Prisma list queries simple', async () => {
  const cases = [
    {
      controller: createConsignmentController,
      clientKey: 'consignment',
      method: 'list',
      query: { limit: '500', offset: '25', status: 'active' },
      expected: { where: { status: 'active' }, orderBy: { consignmentNum: 'desc' } },
    },
    {
      controller: createArchivedController,
      clientKey: 'consignment',
      method: 'listConsignments',
      query: { limit: '500', offset: '25' },
      expected: { where: { status: 'archived' }, orderBy: { consignmentNum: 'desc' } },
    },
    {
      controller: createLeadController,
      clientKey: 'lead',
      method: 'list',
      query: { limit: '500', offset: '25' },
      expected: { orderBy: { id: 'desc' } },
    },
    {
      controller: createDocumentController,
      clientKey: 'document',
      method: 'list',
      query: { limit: '500', offset: '25' },
      expected: { orderBy: { id: 'desc' } },
    },
  ];

  for (const item of cases) {
    const delegate = createDelegate([{ id: 1 }]);
    const controller = item.controller({ prisma: { [item.clientKey]: delegate } });
    const response = createResponse();

    await controller[item.method]({ query: item.query }, response);

    assert.equal(delegate.calls.length, 1);
    assert.deepEqual(delegate.calls[0], item.expected);
    assert.deepEqual(response.payload, { success: true, data: [{ id: 1 }] });
  }
});
