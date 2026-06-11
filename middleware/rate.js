import { AppError } from '../utils/errorHandling.js';

export class TooManyRequestsError extends AppError { static statusCode = 429; static code = 'too_many_requests'; }
export class RateStore {
  constructor({ clock = () => Date.now() / 1000, hits = new Map() } = {}) { this.clock = clock; this.hits = hits; }
  add(key, { limit, window }) {
    const now = this.clock(); const start = now - window;
    const vals = (this.hits.get(key) ?? []).filter((ts) => ts > start);
    const ok = vals.length < limit;
    if (ok) vals.push(now);
    this.hits.set(key, vals);
    return [ok, Math.max(limit - vals.length, 0)];
  }
}
export class LoginRateMw {
  constructor(app, { limit = 5, window = 60, paths = ['/login'], store = null } = {}) { this.app = app; this.limit = limit; this.window = window; this.paths = paths; this.store = store ?? new RateStore(); }
  handle(req) { if (this.matches(req)) { const [ok, left] = this.store.add(this.key(req), { limit: this.limit, window: this.window }); if (!ok) throw new TooManyRequestsError('Too many login attempts. Please try again later.', { details: { retry_after: this.window, remaining: left } }); } return this.app(req); }
  matches(req) { return String(req?.method ?? 'GET').toUpperCase() === 'POST' && this.paths.includes(req?.path ?? '/'); }
  key(req) { const headers = req?.headers ?? {}; return String(req?.client_ip ?? req?.ip ?? String(headers['X-Forwarded-For'] ?? '').split(',')[0].trim() ?? 'anonymous') || 'anonymous'; }
}
