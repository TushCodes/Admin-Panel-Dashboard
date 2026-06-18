import assert from 'node:assert/strict';
import test from 'node:test';

import { createApp } from '../server.js';

function createFakeExpress() {
  const routes = [];
  const middleware = [];
  function express() {
    return {
      routes,
      middleware,
      disabled: [],
      disable(name) { this.disabled.push(name); },
      use(handler) { middleware.push(handler); },
      get(path, handler) { routes.push({ method: 'GET', path, handler }); },
      post(path, handler) { routes.push({ method: 'POST', path, handler }); },
    };
  }
  express.json = () => 'json-parser';
  return express;
}

function createResponse() {
  return {
    statusCode: 200,
    payload: null,
    headers: {},
    status(code) { this.statusCode = code; return this; },
    setHeader(name, value) { this.headers[name] = value; return this; },
    sendStatus(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; },
  };
}

test('createApp wires basic Express routes and middleware', async () => {
  const fakeExpress = createFakeExpress();
  const loggerCalls = [];
  const fakeMorgan = (format) => {
    loggerCalls.push(format);
    return 'request-logger';
  };
  const app = await createApp({ expressModule: fakeExpress, morganModule: fakeMorgan, loggerFormat: 'tiny' });

  assert.deepEqual(app.disabled, ['x-powered-by']);
  assert.deepEqual(loggerCalls, ['tiny']);
  assert.equal(app.middleware[0], 'request-logger');
  assert.equal(app.middleware[1], 'json-parser');
  assert.equal(typeof app.middleware[2], 'function');

  const root = app.routes.find((route) => route.path === '/');
  const health = app.routes.find((route) => route.path === '/health');
  assert.equal(root?.method, 'GET');
  assert.equal(health?.method, 'GET');

  const rootResponse = createResponse();
  await root.handler({}, rootResponse);
  assert.equal(rootResponse.payload.message, 'Admin Panel Dashboard API');
  assert.deepEqual(rootResponse.payload.endpoints, {
    health: '/health',
    login: '/auth/login',
    consignments: '/consignments/aggregated-consignments',
    leads: '/leads',
    documents: '/documents',
    archived: '/archived/consignments',
  });

  const healthResponse = createResponse();
  await health.handler({}, healthResponse);
  assert.equal(healthResponse.payload.status, 'ok');
  assert.match(healthResponse.payload.timestamp, /^\d{4}-\d{2}-\d{2}T/);
});

test('CORS middleware only allows the local MVP frontend origins', async () => {
  const fakeExpress = createFakeExpress();
  const app = await createApp({ expressModule: fakeExpress, morganModule: () => 'request-logger' });
  const corsMiddleware = app.middleware[2];

  const allowedResponse = createResponse();
  await corsMiddleware(
    { method: 'OPTIONS', headers: { origin: 'http://localhost:5173' } },
    allowedResponse,
    () => assert.fail('allowed CORS preflight should not continue'),
  );

  assert.equal(allowedResponse.statusCode, 204);
  assert.equal(allowedResponse.headers['Access-Control-Allow-Origin'], 'http://localhost:5173');
  assert.equal(allowedResponse.headers['Access-Control-Allow-Headers'], 'Content-Type');
  assert.equal(allowedResponse.headers['Access-Control-Allow-Methods'], 'GET, POST, PATCH');
  assert.equal(allowedResponse.headers['Access-Control-Allow-Credentials'], undefined);

  const blockedResponse = createResponse();
  let continued = false;
  await corsMiddleware(
    { method: 'OPTIONS', headers: { origin: 'http://example.com' } },
    blockedResponse,
    () => { continued = true; },
  );

  assert.equal(continued, true);
  assert.deepEqual(blockedResponse.headers, {});
});

test('resource routes are mounted without a versioned API prefix', async () => {
  const { registerRoutes } = await import('../routes/index.js');
  const mounted = [];
  const app = { use(path, router) { mounted.push({ path, router }); } };
  const options = {
    consignmentRoutes: 'consignment-router',
    leadRoutes: 'lead-router',
    documentRoutes: 'document-router',
    archivedRoutes: 'archived-router',
  };

  registerRoutes(app, options);

  assert.deepEqual(mounted, [
    { path: '/consignments', router: 'consignment-router' },
    { path: '/leads', router: 'lead-router' },
    { path: '/documents', router: 'document-router' },
    { path: '/archived', router: 'archived-router' },
  ]);
});
