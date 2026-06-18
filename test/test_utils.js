import assert from 'node:assert/strict';
import test from 'node:test';

import { DatabaseConnectionDisabledError, ensureDatabaseConnectionEnabled } from '../utils/dbError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { BadRequestError, NotFoundError, handleException } from '../utils/errorHandling.js';
import { APIResponse, DataNormalizer, JsonUtils, jsonResponse, normalizeDelimitedStringList, normalizeForJson, parseJsonBody, toJson } from '../utils/json.js';
import { getLogger } from '../utils/logging.js';

test('parseJsonBody accepts object payloads', () => {
  assert.deepEqual(parseJsonBody('{"name":"Ada","active":true}'), { name: 'Ada', active: true });
});

test('parseJsonBody rejects invalid JSON', () => {
  assert.throws(() => parseJsonBody('{"name":'), BadRequestError);
});

test('jsonResponse uses the standard envelope', () => {
  const [payload, statusCode] = jsonResponse({ id: 1 }, { message: 'Created', statusCode: 201 });
  assert.equal(statusCode, 201);
  assert.deepEqual(payload, { success: true, message: 'Created', data: { id: 1 } });
});

test('utility class facades expose MVP helpers', () => {
  assert.deepEqual(APIResponse.success({ id: 1 }), [{ success: true, message: 'OK', data: { id: 1 } }, 200]);
  assert.equal(JsonUtils.toJson({ id: 2n }), '{"id":"2"}');
  assert.equal(DataNormalizer.normalizeDateOnly('2026-06-18T12:00:00.000Z'), '2026-06-18');
});

test('toJson serializes dates compactly', () => {
  assert.equal(toJson({ created_on: new Date('2026-06-09T00:00:00.000Z') }), '{"created_on":"2026-06-09"}');
});

test('function utility exports cover JSON normalization and responses', () => {
  assert.deepEqual(normalizeForJson({ id: 1n }), { id: '1' });
  assert.deepEqual(jsonResponse({ id: 1 }), [{ success: true, message: 'OK', data: { id: 1 } }, 200]);
});


test('data normalization helpers trim delimited lists', () => {
  assert.deepEqual(normalizeDelimitedStringList(' name, -created_at, ,status '), ['name', '-created_at', 'status']);
});

test('asyncHandler forwards rejected errors to next', async () => {
  const expected = new Error('boom');
  const calls = [];
  const handler = asyncHandler(async () => {
    throw expected;
  });

  await handler({}, {}, (error) => calls.push(error));
  assert.deepEqual(calls, [expected]);
});

test('asyncHandler validates handler input', () => {
  assert.throws(() => asyncHandler(null), TypeError);
});

test('handleException maps AppError subclasses', () => {
  const [payload, statusCode] = handleException(new NotFoundError('Lead not found.'));
  assert.equal(statusCode, 404);
  assert.deepEqual(payload, { success: false, error: { code: 'not_found', message: 'Lead not found.' } });
});

test('handleException hides unexpected error details by default', () => {
  const [payload, statusCode] = handleException(new Error('secret details'));
  assert.equal(statusCode, 500);
  assert.equal(payload.error.code, 'internal_server_error');
  assert.equal('details' in payload.error, false);
});

test('getLogger returns namespaced singleton', () => {
  const first = getLogger('test');
  const second = getLogger('test');
  assert.equal(first, second);
  assert.equal(first.name, 'admin_panel_dashboard.test');
  assert.equal(first.handlers.length, 1);
});

test('ensureDatabaseConnectionEnabled raises without required env vars', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalSecretKey = process.env.SECRET_KEY;
  delete process.env.DATABASE_URL;
  delete process.env.SECRET_KEY;
  assert.throws(() => ensureDatabaseConnectionEnabled(), DatabaseConnectionDisabledError);
  if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = originalDatabaseUrl;
  if (originalSecretKey === undefined) delete process.env.SECRET_KEY; else process.env.SECRET_KEY = originalSecretKey;
});
