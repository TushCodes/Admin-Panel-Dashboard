import assert from 'node:assert/strict';
import test from 'node:test';

import { ApiMw, LoginMw, LoginRateMw, RateStore, initMw } from '../middleware/index.js';
import { UnauthorizedError } from '../utils/errorHandling.js';

test('ApiMw wraps handler responses', () => {
  const app = new ApiMw(() => ({ id: 1 }));
  const [payload, code] = app.handle({ path: '/leads' });
  assert.equal(code, 200);
  assert.deepEqual(payload, { success: true, message: 'OK', data: { id: 1 } });
});

test('LoginMw requires a bearer token for protected paths', () => {
  const app = new LoginMw(() => 'ok', { token: 'secret' });
  assert.equal(app.handle({ path: '/health' }), 'ok');
  assert.equal(app.handle({ path: '/admin', headers: { Authorization: 'Bearer secret' } }), 'ok');
  assert.throws(() => app.handle({ path: '/admin', headers: {} }), UnauthorizedError);
});

test('LoginRateMw blocks repeated login attempts', () => {
  let now = 100;
  const store = new RateStore({ clock: () => now });
  const app = new LoginRateMw(() => 'ok', { limit: 2, window: 60, store });
  assert.equal(app.handle({ method: 'POST', path: '/login', ip: '1.2.3.4' }), 'ok');
  assert.equal(app.handle({ method: 'POST', path: '/login', ip: '1.2.3.4' }), 'ok');
  assert.throws(() => app.handle({ method: 'POST', path: '/login', ip: '1.2.3.4' }), /Too many login attempts/);
  now = 200;
  assert.equal(app.handle({ method: 'POST', path: '/login', ip: '1.2.3.4' }), 'ok');
});

test('initMw composes middleware factories', () => {
  const app = initMw(() => ({ ok: true }), [(next) => new ApiMw(next)]);
  const [payload] = app({ path: '/' });
  assert.deepEqual(payload.data, { ok: true });
});
