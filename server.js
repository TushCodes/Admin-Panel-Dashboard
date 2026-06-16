import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { asyncHandler, handleException } from './utils/index.js';

const frontendRoot = join(dirname(fileURLToPath(import.meta.url)), 'frontend');

function getAllowedOrigins() {
  return (process.env.CORS_ORIGIN ?? process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
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
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    return next();
  });

  if (typeof express.static === 'function' && existsSync(frontendRoot)) {
    app.use('/assets', express.static(join(frontendRoot, 'assets')));
    app.use(express.static(frontendRoot, { index: false }));
    app.get('/auth/login', (_req, res) => res.sendFile(join(frontendRoot, 'index.html')));
    app.get(['/admin', '/admin/consignments', '/admin/lead', '/admin/documents'], (_req, res) => res.sendFile(join(frontendRoot, 'index.html')));
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
        login: '/auth/login',
        consignments: '/consignments',
        leads: '/leads',
        documents: '/documents',
        archived: '/archived/consignments',
      },
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
