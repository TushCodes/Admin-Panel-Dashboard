import assert from 'node:assert/strict';
import test from 'node:test';

import { fetchExternalApiRecords } from '../api/index.js';

test('fetchExternalApiRecords returns an empty scaffold result by default', async () => {
  const records = await fetchExternalApiRecords();

  assert.deepEqual(records, []);
});

test('fetchExternalApiRecords returns provided scaffold records for aggregation', async () => {
  const externalApiRecords = [{ id: 'external-1', status: 'ready' }];
  const records = await fetchExternalApiRecords({ externalApiRecords });

  assert.deepEqual(records, externalApiRecords);
});
