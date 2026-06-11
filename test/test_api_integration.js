import assert from 'node:assert/strict';
import test from 'node:test';

import { APIConfig, APIRequest, APIResponse } from '../model/api.js';
import { ExternalAPIError, buildApiUrl, sendJsonRequest } from '../utils/apiClient.js';

test('APIConfig merges default, auth, and request headers', () => {
  const config = new APIConfig({ baseUrl: 'https://api.example.com/', defaultHeaders: { 'X-App': 'dashboard' }, apiKey: 'secret-token' });
  const headers = config.headers({ 'X-Request': 'lead-sync' });
  assert.equal(config.normalizedBaseUrl, 'https://api.example.com');
  assert.equal(headers.Accept, 'application/json');
  assert.equal(headers['X-App'], 'dashboard');
  assert.equal(headers.Authorization, 'Bearer secret-token');
  assert.equal(headers['X-Request'], 'lead-sync');
});

test('APIRequest normalizes method', () => {
  assert.equal(new APIRequest({ method: 'post', path: '/leads', json: { name: 'Ada' } }).method, 'POST');
});

test('APIResponse ok flags success status codes', () => {
  assert.equal(new APIResponse({ statusCode: 204 }).ok, true);
  assert.equal(new APIResponse({ statusCode: 404 }).ok, false);
});

test('buildApiUrl includes path and repeated query values', () => {
  const config = new APIConfig({ baseUrl: 'https://api.example.com/v1/' });
  const request = new APIRequest({ method: 'GET', path: 'consignments', query: { status: 'open', tag: ['a', 'b'] } });
  assert.equal(buildApiUrl(config, request), 'https://api.example.com/v1/consignments?status=open&tag=a&tag=b');
});

test('sendJsonRequest posts JSON body and headers', async () => {
  const captured = {};
  const transport = async (url, init) => {
    captured.url = url;
    captured.method = init.method;
    captured.body = init.body;
    captured.contentType = init.headers['Content-Type'];
    return new Response('{"id":123}', { status: 201, headers: { 'X-Trace': 'abc' } });
  };
  const response = await sendJsonRequest(new APIConfig({ baseUrl: 'https://api.example.com', timeoutSeconds: 3 }), new APIRequest({ method: 'POST', path: '/leads', json: { name: 'Ada' } }), { transport });
  assert.equal(captured.url, 'https://api.example.com/leads');
  assert.equal(captured.method, 'POST');
  assert.equal(captured.body, '{"name":"Ada"}');
  assert.equal(captured.contentType, 'application/json');
  assert.equal(response.statusCode, 201);
  assert.deepEqual(response.data, { id: 123 });
  assert.equal(response.headers['x-trace'], 'abc');
});

test('sendJsonRequest raises ExternalAPIError for HTTP errors', async () => {
  const transport = async () => new Response('{"message":"invalid"}', { status: 400 });
  await assert.rejects(
    () => sendJsonRequest(new APIConfig({ baseUrl: 'https://api.example.com' }), new APIRequest({ method: 'GET', path: '/broken' }), { transport }),
    (error) => error instanceof ExternalAPIError && error.statusCode === 400 && error.details.response.message === 'invalid',
  );
});

test('sendJsonRequest raises ExternalAPIError for network errors', async () => {
  const transport = async () => { throw new Error('timed out'); };
  await assert.rejects(
    () => sendJsonRequest(new APIConfig({ baseUrl: 'https://api.example.com' }), new APIRequest({ method: 'GET', path: '/slow' }), { transport }),
    (error) => error instanceof ExternalAPIError && error.statusCode === 502 && error.details.reason === 'timed out',
  );
});
