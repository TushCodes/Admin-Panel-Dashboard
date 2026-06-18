import assert from 'node:assert/strict';
import { once } from 'node:events';
import http from 'node:http';
import test from 'node:test';

import express from 'express';

import { CONSIGNMENT_LIST_ORDER } from '../db/consignments.js';
import { consignmentRoutes } from '../routes/consignments.js';
import {
  DATA_SOURCES,
  fetchAggregatedConsignmentsList,
  fetchAggregatedExternalApiList,
  validateExternalApiRecordFormat,
} from '../services/dataAggregator.js';

function buildConsignmentRecord(overrides = {}) {
  return {
    consignmentNum: 'CN00000000000004',
    status: 'created',
    pickupAddress: null,
    pickupPincode: null,
    pickupTag: null,
    pickupDate: null,
    dropAddress: null,
    dropPincode: null,
    dropTag: null,
    dropDate: null,
    ...overrides,
  };
}

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

test('validateExternalApiRecordFormat accepts records that exactly match consignments', () => {
  const record = buildConsignmentRecord();

  assert.equal(validateExternalApiRecordFormat(record), record);
});

test('validateExternalApiRecordFormat rejects external API records with missing or extra fields', () => {
  const { dropDate, ...record } = buildConsignmentRecord({ externalId: 'unexpected' });

  assert.throws(
    () => validateExternalApiRecordFormat(record, 2),
    (error) => {
      assert.equal(error.code, 'external_api_format_mismatch');
      assert.deepEqual(error.details, {
        index: 2,
        missingFields: ['dropDate'],
        unexpectedFields: ['externalId'],
      });
      return true;
    },
  );
});

test('fetchAggregatedExternalApiList prepares valid external API records for aggregation', async () => {
  const externalApiRecords = [buildConsignmentRecord({ consignmentNum: 'CN00000000000005' })];

  const result = await fetchAggregatedExternalApiList({ externalApiRecords });

  assert.deepEqual(result, [
    { source: DATA_SOURCES.EXTERNAL_APIS, ...externalApiRecords[0] },
  ]);
});

test('fetchAggregatedConsignmentsList combines database and valid external API records', async () => {
  const rows = [buildConsignmentRecord({ consignmentNum: 'CN00000000000004' })];
  const externalApiRecords = [buildConsignmentRecord({ consignmentNum: 'CN00000000000005', status: 'ready' })];
  const prisma = {
    consignment: {
      async findMany() {
        return rows;
      },
    },
  };

  const result = await fetchAggregatedConsignmentsList({ prisma, externalApiRecords });

  assert.deepEqual(result, [
    { source: DATA_SOURCES.CONSIGNMENTS, ...rows[0] },
    { source: DATA_SOURCES.EXTERNAL_APIS, ...externalApiRecords[0] },
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
