import { pathToFileURL } from 'node:url';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';

import { asyncHandler, handleException } from './utils/index.js';

const ADMIN_TOKEN_TTL_SECONDS = 60 * 60 * 8;
const API_PREFIX = '/api/v1';

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
    const adminId = process.env.ADMIN_ID;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const submittedId = String(req.body?.id ?? '').trim();
    const submittedPassword = String(req.body?.password ?? '');

    if (!adminId || !adminPassword) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'admin_auth_not_configured',
          message: 'Admin login is not configured. Set ADMIN_ID and ADMIN_PASSWORD on the server.',
        },
      });
    }

    const idMatches = submittedId === adminId;
    const passwordMatches = adminPasswordMatches(submittedPassword, adminPassword);
    if (!idMatches || !passwordMatches) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'invalid_admin_credentials',
          message: 'Invalid admin ID or password.',
        },
      });
    }

    const session = createAdminSessionToken(adminId);
    return res.json({
      success: true,
      message: 'Admin login successful.',
      user: { id: adminId },
      session,
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
