import { timingSafeEqual } from 'node:crypto';
import { UnauthorizedError } from '../utils/errorHandling.js';

export class LoginMw {
  constructor(app, { token = null, authFn = null, publicPaths = ['/login', '/health'] } = {}) {
    this.app = app; this.token = token; this.authFn = authFn; this.public = publicPaths;
  }
  handle(req) { if (this.isPublic(req) || this.isValid(req)) return this.app(req); throw new UnauthorizedError('Login is required.'); }
  isPublic(req) { const path = get(req, 'path', '/') || '/'; return this.public.some((item) => path === item || path.startsWith(`${item.replace(/\/$/, '')}/`)); }
  isValid(req) { const tok = token(req); if (!tok) return false; if (this.authFn) return Boolean(this.authFn(tok, req)); if (this.token) return safeCompare(tok, this.token); return false; }
}
function token(req) { const headers = get(req, 'headers', {}) || {}; const val = headers.Authorization ?? headers.authorization; if (!val) return null; const [kind, ...parts] = String(val).split(' '); return kind.toLowerCase() === 'bearer' && parts.length ? parts.join(' ').trim() : null; }
function safeCompare(left, right) { const a = Buffer.from(left); const b = Buffer.from(right); return a.length === b.length && timingSafeEqual(a, b); }
function get(obj, key, fallback = null) { return obj?.[key] ?? fallback; }
