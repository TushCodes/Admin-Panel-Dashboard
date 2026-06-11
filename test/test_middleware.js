import assert from 'node:assert/strict';
import test from 'node:test';

import { LoginMw, LoginRateMw, RateStore, initMw } from '../middleware/index.js';
import { UnauthorizedError } from '../utils/errorHandling.js';

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
  class MarkerMw {
    constructor(app) { this.app = app; }
    handle(req) { return `${this.app(req)} marked`; }
  }
  const app = initMw(() => 'ok', [MarkerMw]);
  assert.equal(app({ path: '/' }), 'ok marked');
});
