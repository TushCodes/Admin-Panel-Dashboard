import assert from 'node:assert/strict';
import test from 'node:test';

import { CONSIGNMENT_LIST_ORDER } from '../db/consignments.js';
import { DATA_SOURCES, fetchAggregatedList } from '../services/dataAggregator.js';

test('fetchAggregatedList builds an aggregated list from consignments', async () => {
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

  const result = await fetchAggregatedList({ prisma });

  assert.deepEqual(calls, [{ orderBy: CONSIGNMENT_LIST_ORDER }]);
  assert.deepEqual(result, [
    { source: DATA_SOURCES.CONSIGNMENTS, consignmentNum: 'CN00000000000002', status: 'created' },
    { source: DATA_SOURCES.CONSIGNMENTS, consignmentNum: 'CN00000000000001', status: 'delivered' },
  ]);
});
