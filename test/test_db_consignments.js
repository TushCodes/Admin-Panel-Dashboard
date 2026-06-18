import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CONSIGNMENT_LIST_ORDER,
  createConsignment,
  deleteConsignment,
  fetchConsignmentList,
  mutateConsignment,
  updateConsignment,
} from '../db/consignments.js';
import { BadRequestError, ConflictError, NotFoundError } from '../utils/errorHandling.js';

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

function createConsignmentDelegate(existing = null) {
  const calls = [];
  return {
    calls,
    async findUnique(args) {
      calls.push(['findUnique', args]);
      return existing;
    },
    async create(args) {
      calls.push(['create', args]);
      return { ...args.data };
    },
    async update(args) {
      calls.push(['update', args]);
      return { consignmentNum: args.where.consignmentNum, ...args.data };
    },
    async delete(args) {
      calls.push(['delete', args]);
      return { consignmentNum: args.where.consignmentNum };
    },
  };
}

test('createConsignment validates input, checks duplicates, and creates a record', async () => {
  const delegate = createConsignmentDelegate();
  const result = await createConsignment(
    { consignmentNum: 'CN0001', status: 'Booked', pickupDate: '2026-06-18', ignored: true },
    { prisma: { consignment: delegate } },
  );

  assert.deepEqual(result, {
    consignmentNum: 'CN0001',
    status: 'Booked',
    pickupDate: new Date('2026-06-18'),
  });
  assert.deepEqual(delegate.calls, [
    ['findUnique', { where: { consignmentNum: 'CN0001' } }],
    ['create', { data: { consignmentNum: 'CN0001', status: 'Booked', pickupDate: new Date('2026-06-18') } }],
  ]);
});

test('createConsignment returns a conflict when consignment already exists', async () => {
  const delegate = createConsignmentDelegate({ consignmentNum: 'CN0001' });
  await assert.rejects(
    () => createConsignment({ consignmentNum: 'CN0001' }, { prisma: { consignment: delegate } }),
    ConflictError,
  );
});

test('updateConsignment checks existence and updates editable fields only', async () => {
  const delegate = createConsignmentDelegate({ consignmentNum: 'CN0001' });
  const result = await updateConsignment(
    'CN0001',
    { consignmentNum: 'CN0002', status: 'Delivered', unknown: 'skip' },
    { prisma: { consignment: delegate } },
  );

  assert.deepEqual(result, { consignmentNum: 'CN0001', status: 'Delivered' });
  assert.deepEqual(delegate.calls, [
    ['findUnique', { where: { consignmentNum: 'CN0001' } }],
    ['update', { where: { consignmentNum: 'CN0001' }, data: { status: 'Delivered' } }],
  ]);
});

test('updateConsignment returns not found for missing records', async () => {
  const delegate = createConsignmentDelegate(null);
  await assert.rejects(
    () => updateConsignment('CN404', { status: 'Lost' }, { prisma: { consignment: delegate } }),
    NotFoundError,
  );
});

test('deleteConsignment checks existence and deletes a record', async () => {
  const delegate = createConsignmentDelegate({ consignmentNum: 'CN0001' });
  const result = await deleteConsignment('CN0001', { prisma: { consignment: delegate } });

  assert.deepEqual(result, { consignmentNum: 'CN0001' });
  assert.deepEqual(delegate.calls, [
    ['findUnique', { where: { consignmentNum: 'CN0001' } }],
    ['delete', { where: { consignmentNum: 'CN0001' } }],
  ]);
});

test('mutateConsignment dispatches supported CRUD actions and rejects unknown scenarios', async () => {
  const createDelegate = createConsignmentDelegate();
  await mutateConsignment(
    { action: 'create', payload: { consignmentNum: 'CN0001' } },
    { prisma: { consignment: createDelegate } },
  );

  await assert.rejects(
    () => mutateConsignment({ action: 'archive', payload: { consignmentNum: 'CN0001' } }, { prisma: { consignment: createDelegate } }),
    BadRequestError,
  );
});
