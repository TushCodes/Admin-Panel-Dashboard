import assert from 'node:assert/strict';
import test from 'node:test';

import { CONSIGNMENT_LIST_ORDER, fetchConsignmentList } from '../db/consignments.js';

test('fetchConsignmentList fetches the whole consignment list ordered by consignment number', async () => {
  const rows = [{ consignmentNum: 'CN00000000000001' }, { consignmentNum: 'CN00000000000002' }];
  const calls = [];
  const prisma = {
    consignment: {
      async findMany(args) {
        calls.push(args);
        return rows;
      },
    },
  };

  const result = await fetchConsignmentList({ prisma });

  assert.equal(result, rows);
  assert.deepEqual(calls, [{ orderBy: CONSIGNMENT_LIST_ORDER }]);
});
