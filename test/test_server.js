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
    status(code) { this.statusCode = code; return this; },
    setHeader() { return this; },
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
  const login = app.routes.find((route) => route.path === '/api/v1/auth/login');
  assert.equal(root?.method, 'GET');
  assert.equal(health?.method, 'GET');
  assert.equal(login?.method, 'POST');

  const rootResponse = createResponse();
  await root.handler({}, rootResponse);
  assert.equal(rootResponse.payload.message, 'Admin Panel Dashboard API');
  assert.deepEqual(rootResponse.payload.endpoints, {
    health: '/health',
    login: '/api/v1/auth/login',
    consignments: '/api/v1/consignments',
    leads: '/api/v1/leads',
    archived: '/api/v1/archived/consignments',
  });

  const healthResponse = createResponse();
  await health.handler({}, healthResponse);
  assert.equal(healthResponse.payload.status, 'ok');
  assert.match(healthResponse.payload.timestamp, /^\d{4}-\d{2}-\d{2}T/);
});

test('admin login validates environment credentials', async () => {
  const originalId = process.env.ADMIN_ID;
  const originalPassword = process.env.ADMIN_PASSWORD;
  const originalSupabaseUrl = process.env.SUPABASE_URL;
  const originalSupabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const originalSupabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.ADMIN_ID = 'owner';
  process.env.ADMIN_PASSWORD = 'secret-pass';
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_ANON_KEY;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const fakeExpress = createFakeExpress();
    const app = await createApp({ expressModule: fakeExpress, morganModule: () => 'request-logger' });
    const login = app.routes.find((route) => route.path === '/api/v1/auth/login');

    const failedResponse = createResponse();
    await login.handler({ body: { username: 'owner', password: 'wrong' } }, failedResponse);
    assert.equal(failedResponse.statusCode, 401);
    assert.equal(failedResponse.payload.message, 'Invalid username or password');

    const successfulResponse = createResponse();
    await login.handler({ body: { username: 'owner', password: 'secret-pass' } }, successfulResponse);
    assert.equal(successfulResponse.statusCode, 200);
    assert.equal(successfulResponse.payload.message, 'Login successful');
    assert.equal(successfulResponse.payload.user.id, 'owner');
    assert.equal(successfulResponse.payload.user.role, 'admin');
    assert.match(successfulResponse.payload.session.token, /^[^.]+\.[a-f0-9]{64}$/);
  } finally {
    if (originalId === undefined) delete process.env.ADMIN_ID;
    else process.env.ADMIN_ID = originalId;
    if (originalPassword === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = originalPassword;
    if (originalSupabaseUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = originalSupabaseUrl;
    if (originalSupabaseAnonKey === undefined) delete process.env.SUPABASE_ANON_KEY;
    else process.env.SUPABASE_ANON_KEY = originalSupabaseAnonKey;
    if (originalSupabaseServiceRoleKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = originalSupabaseServiceRoleKey;
  }
});

test('admin login authenticates admin profiles through Supabase', async () => {
  const originalUrl = process.env.SUPABASE_URL;
  const originalAnonKey = process.env.SUPABASE_ANON_KEY;
  const originalServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'anon-key';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';

  const fetchCalls = [];
  const fetchImpl = async (url, options) => {
    fetchCalls.push({ url, options });
    if (url.includes('/rest/v1/profiles')) {
      return {
        ok: true,
        json: async () => ({ email: 'admin@example.com', role: 'admin' }),
      };
    }
    if (url.includes('/auth/v1/token')) {
      return {
        ok: true,
        json: async () => ({ access_token: 'token', user: { id: 'user-1', email: 'admin@example.com' } }),
      };
    }
    throw new Error(`Unexpected fetch URL: ${url}`);
  };

  try {
    const fakeExpress = createFakeExpress();
    const app = await createApp({ expressModule: fakeExpress, morganModule: () => 'request-logger', routeOptions: { fetchImpl } });
    const login = app.routes.find((route) => route.path === '/api/v1/auth/login');

    const response = createResponse();
    await login.handler({ body: { username: 'admin', password: 'secret-pass' } }, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.payload.message, 'Login successful');
    assert.deepEqual(response.payload.user, { id: 'user-1', email: 'admin@example.com' });
    assert.equal(response.payload.session.access_token, 'token');
    assert.equal(fetchCalls[0].options.headers.Authorization, 'Bearer service-key');
    assert.equal(fetchCalls[1].options.headers.Authorization, 'Bearer anon-key');
    assert.match(fetchCalls[1].options.body, /"password":"secret-pass"/);
  } finally {
    if (originalUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = originalUrl;
    if (originalAnonKey === undefined) delete process.env.SUPABASE_ANON_KEY;
    else process.env.SUPABASE_ANON_KEY = originalAnonKey;
    if (originalServiceRoleKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceRoleKey;
  }
});


test('admin login maps configured username to Supabase auth email', async () => {
  const originalUrl = process.env.SUPABASE_URL;
  const originalAnonKey = process.env.SUPABASE_ANON_KEY;
  const originalServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const originalAdminUsername = process.env.SUPABASE_ADMIN_USERNAME;
  const originalAdminEmail = process.env.SUPABASE_ADMIN_EMAIL;
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'anon-key';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
  process.env.SUPABASE_ADMIN_USERNAME = 'admin';
  process.env.SUPABASE_ADMIN_EMAIL = 'admin@gramscs.com';

  const fetchCalls = [];
  const fetchImpl = async (url, options) => {
    fetchCalls.push({ url, options });
    if (url.includes('/rest/v1/profiles')) {
      return {
        ok: false,
        json: async () => ({ code: 'PGRST116', message: 'No profile found' }),
      };
    }
    if (url.includes('/auth/v1/token')) {
      return {
        ok: true,
        json: async () => ({ access_token: 'token', user: { id: 'user-1', email: 'admin@gramscs.com' } }),
      };
    }
    throw new Error(`Unexpected fetch URL: ${url}`);
  };

  try {
    const fakeExpress = createFakeExpress();
    const app = await createApp({ expressModule: fakeExpress, morganModule: () => 'request-logger', routeOptions: { fetchImpl } });
    const login = app.routes.find((route) => route.path === '/api/v1/auth/login');

    const response = createResponse();
    await login.handler({ body: { username: 'admin', password: 'adminpass' } }, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.payload.message, 'Login successful');
    assert.equal(response.payload.user.email, 'admin@gramscs.com');
    assert.match(fetchCalls[1].options.body, /"email":"admin@gramscs.com"/);
    assert.match(fetchCalls[1].options.body, /"password":"adminpass"/);
  } finally {
    if (originalUrl === undefined) delete process.env.SUPABASE_URL;
    else process.env.SUPABASE_URL = originalUrl;
    if (originalAnonKey === undefined) delete process.env.SUPABASE_ANON_KEY;
    else process.env.SUPABASE_ANON_KEY = originalAnonKey;
    if (originalServiceRoleKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceRoleKey;
    if (originalAdminUsername === undefined) delete process.env.SUPABASE_ADMIN_USERNAME;
    else process.env.SUPABASE_ADMIN_USERNAME = originalAdminUsername;
    if (originalAdminEmail === undefined) delete process.env.SUPABASE_ADMIN_EMAIL;
    else process.env.SUPABASE_ADMIN_EMAIL = originalAdminEmail;
  }
});


test('resource routes are mounted under the versioned API prefix', async () => {
  const { registerRoutes } = await import('../routes/index.js');
  const mounted = [];
  const app = { use(path, router) { mounted.push({ path, router }); } };
  const options = {
    consignmentRoutes: 'consignment-router',
    leadRoutes: 'lead-router',
    archivedRoutes: 'archived-router',
  };

  registerRoutes(app, options);

  assert.deepEqual(mounted, [
    { path: '/api/v1/consignments', router: 'consignment-router' },
    { path: '/api/v1/leads', router: 'lead-router' },
    { path: '/api/v1/archived', router: 'archived-router' },
  ]);
});
