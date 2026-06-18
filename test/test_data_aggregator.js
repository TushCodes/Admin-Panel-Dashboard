import assert from 'node:assert/strict';
import { once } from 'node:events';
import http from 'node:http';
import test from 'node:test';

import express from 'express';

import { CONSIGNMENT_LIST_ORDER } from '../db/consignments.js';
import { consignmentRoutes } from '../routes/consignments.js';
import { DATA_SOURCES, fetchAggregatedConsignmentsList } from '../services/dataAggregator.js';

test('fetchAggregatedConsignmentsList builds an aggregated list from consignments', async () => {
  const rows = [
    { consignmentNum: 'CN00000000000002', status: 'created' },
    { consignmentNum: 'CN00000000000001', status: 'delivered' },
  ];
  const calls = [];
  const prisma = {
    consignment: {
      async findMany(args) {
        calls.push(args);
        return rows;
      },
    },
  };

  const result = await fetchAggregatedConsignmentsList({ prisma });

  assert.deepEqual(calls, [{ orderBy: CONSIGNMENT_LIST_ORDER }]);
  assert.deepEqual(result, [
    { source: DATA_SOURCES.CONSIGNMENTS, consignmentNum: 'CN00000000000002', status: 'created' },
    { source: DATA_SOURCES.CONSIGNMENTS, consignmentNum: 'CN00000000000001', status: 'delivered' },
  ]);
});

test('GET /consignments/aggregated-consignments serves the data aggregator output', async () => {
  const rows = [{ consignmentNum: 'CN00000000000003', status: 'in_transit' }];
  const calls = [];
  const prisma = {
    consignment: {
      async findMany(args) {
        calls.push(args);
        return rows;
      },
    },
  };
  const app = express();
  app.use('/consignments', consignmentRoutes({ prisma }));
  const server = http.createServer(app);
  server.listen(0);
  await once(server, 'listening');

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/consignments/aggregated-consignments`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(calls, [{ orderBy: CONSIGNMENT_LIST_ORDER }]);
    assert.deepEqual(payload, {
      success: true,
      data: [{ source: DATA_SOURCES.CONSIGNMENTS, consignmentNum: 'CN00000000000003', status: 'in_transit' }],
    });
  } finally {
    server.close();
    await once(server, 'close');
  }
});
