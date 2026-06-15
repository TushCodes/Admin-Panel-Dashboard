import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { asyncHandler, handleException } from './utils/index.js';

const ADMIN_TOKEN_TTL_SECONDS = 60 * 60 * 8;
const API_PREFIX = '/api/v1';
const frontendRoot = join(dirname(fileURLToPath(import.meta.url)), 'frontend');

function getAllowedOrigins() {
  return (process.env.CORS_ORIGIN ?? process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function adminPasswordMatches(inputPassword, configuredPassword) {
  const password = String(inputPassword ?? '');
  const expected = String(configuredPassword ?? '');
  if (!password || !expected) return false;

  const inputHash = createHash('sha256').update(password).digest();
  const expectedHash = expected.startsWith('sha256:')
    ? Buffer.from(expected.slice('sha256:'.length), 'hex')
    : createHash('sha256').update(expected).digest();

  return inputHash.length === expectedHash.length && timingSafeEqual(inputHash, expectedHash);
}


function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY ?? anonKey;
  return { url, anonKey, serviceKey };
}

async function supabaseJsonRequest({ url, key, path, options = {}, fetchImpl = globalThis.fetch }) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('Fetch API is not available for Supabase authentication requests.');
  }

  const response = await fetchImpl(`${url}${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      ...(options.headers ?? {}),
    },
  });
  const payload = await response.json().catch(() => null);
  return { response, payload };
}

async function findSupabaseAdminProfile(username, { fetchImpl = globalThis.fetch } = {}) {
  const { url, serviceKey } = getSupabaseConfig();
  if (!url || !serviceKey) return { configurationError: true };

  const query = new URLSearchParams({
    select: 'email,role',
    username: `eq.${username}`,
    limit: '1',
  });
  const { response, payload } = await supabaseJsonRequest({
    url,
    key: serviceKey,
    path: `/rest/v1/profiles?${query.toString()}`,
    options: { headers: { Accept: 'application/vnd.pgrst.object+json' } },
    fetchImpl,
  });

  if (!response.ok) return { profileError: payload ?? true };
  return { profile: payload };
}

async function signInSupabasePassword(email, password, { fetchImpl = globalThis.fetch } = {}) {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return { configurationError: true };

  const { response, payload } = await supabaseJsonRequest({
    url,
    key: anonKey,
    path: '/auth/v1/token?grant_type=password',
    options: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    },
    fetchImpl,
  });

  if (!response.ok) return { error: payload ?? true };
  return { data: { user: payload?.user, session: payload } };
}

function createAdminSessionToken(adminId) {
  const expiresAt = new Date(Date.now() + ADMIN_TOKEN_TTL_SECONDS * 1000).toISOString();
  const nonce = randomUUID();
  const signature = createHash('sha256')
    .update(`${adminId}:${expiresAt}:${nonce}:${process.env.SECRET_KEY ?? process.env.ADMIN_PASSWORD ?? ''}`)
    .digest('hex');
  return {
    token: `${nonce}.${signature}`,
    expiresAt,
  };
}

export async function createApp({ expressModule = null, morganModule = null, loggerFormat = process.env.MORGAN_FORMAT ?? 'combined', routeOptions = {} } = {}) {
  const express = expressModule ?? (await import('express')).default;
  const morgan = morganModule ?? (await import('morgan')).default;
  const app = express();

  app.disable('x-powered-by');
  app.use(morgan(loggerFormat));
  app.use(express.json());
  app.use((req, res, next) => {
    const origin = req.headers?.origin;
    if (origin && getAllowedOrigins().includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    return next();
  });

  if (typeof express.static === 'function' && existsSync(frontendRoot)) {
    app.use('/assets', express.static(join(frontendRoot, 'assets')));
    app.use(express.static(frontendRoot, { index: false }));
    app.get('/auth/login', (_req, res) => res.sendFile(join(frontendRoot, 'index.html')));
    app.get(`${API_PREFIX}/admin`, (_req, res) => res.sendFile(join(frontendRoot, 'index.html')));
  }

  if (!expressModule) {
    const { registerRoutes } = await import('./routes/index.js');
    registerRoutes(app, routeOptions);
  }

  app.get('/', asyncHandler(async (_req, res) => {
    res.json({
      success: true,
      message: 'Admin Panel Dashboard API',
      endpoints: {
        health: '/health',
        login: `${API_PREFIX}/auth/login`,
        consignments: `${API_PREFIX}/consignments`,
        leads: `${API_PREFIX}/leads`,
        archived: `${API_PREFIX}/archived/consignments`,
      },
    });
  }));

  app.post(`${API_PREFIX}/auth/login`, asyncHandler(async (req, res) => {
    const username = String(req.body?.username ?? req.body?.id ?? '').trim();
    const password = String(req.body?.password ?? '');
    const fetchImpl = routeOptions.fetchImpl ?? globalThis.fetch;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const { profile, profileError, configurationError: profileConfigurationError } = await findSupabaseAdminProfile(username, { fetchImpl });
    if (profileConfigurationError) {
      const adminId = process.env.ADMIN_ID;
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (!adminId || !adminPassword) {
        return res.status(503).json({
          success: false,
          error: {
            code: 'admin_auth_not_configured',
            message: 'Admin login is not configured. Set Supabase auth variables or ADMIN_ID and ADMIN_PASSWORD on the server.',
          },
        });
      }

      const idMatches = username === adminId;
      const passwordMatches = adminPasswordMatches(password, adminPassword);
      if (!idMatches || !passwordMatches) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const session = createAdminSessionToken(adminId);
      return res.json({
        message: 'Login successful',
        user: { id: adminId, username: adminId, role: 'admin' },
        session,
      });
    }

    if (profileError || !profile) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    if (profile.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    const { data, error, configurationError: signInConfigurationError } = await signInSupabasePassword(profile.email, password, { fetchImpl });
    if (signInConfigurationError) {
      return res.status(503).json({ message: 'Supabase authentication is not configured' });
    }

    if (error) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    return res.json({
      message: 'Login successful',
      user: data.user,
      session: data.session,
    });
  }));

  app.get('/health', asyncHandler(async (_req, res) => {
    res.json({
      success: true,
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }));

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'not_found',
        message: `No route found for ${req.method} ${req.originalUrl}`,
      },
    });
  });

  app.use((error, _req, res, _next) => {
    const [payload, statusCode] = handleException(error, { includeDebug: process.env.NODE_ENV !== 'production' });
    res.status(statusCode).json(payload);
  });

  return app;
}

export async function startServer({ port = process.env.PORT ?? 3000, host = process.env.HOST ?? '0.0.0.0' } = {}) {
  const app = await createApp();
  const server = app.listen(port, host, () => {
    const address = server.address();
    const boundPort = typeof address === 'object' && address ? address.port : port;
    console.log(`Admin Panel Dashboard API listening on http://${host}:${boundPort}`);
  });
  return server;
}

const entrypoint = process.argv[1] ? pathToFileURL(process.argv[1]).href : null;
if (import.meta.url === entrypoint) {
  await startServer();
}
