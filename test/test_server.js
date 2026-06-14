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
    };
  }
  express.json = () => 'json-parser';
  return express;
}

function createResponse() {
  return {
    statusCode: 200,
    payload: null,
    status(code) { this.statusCode = code; return this; },
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

  const root = app.routes.find((route) => route.path === '/');
  const health = app.routes.find((route) => route.path === '/health');
  assert.equal(root?.method, 'GET');
  assert.equal(health?.method, 'GET');

  const rootResponse = createResponse();
  await root.handler({}, rootResponse);
  assert.equal(rootResponse.payload.message, 'Admin Panel Dashboard API');

  const healthResponse = createResponse();
  await health.handler({}, healthResponse);
  assert.equal(healthResponse.payload.status, 'ok');
  assert.match(healthResponse.payload.timestamp, /^\d{4}-\d{2}-\d{2}T/);
});
