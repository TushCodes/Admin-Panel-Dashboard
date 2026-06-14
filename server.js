import { pathToFileURL } from 'node:url';

import { asyncHandler, handleException } from './utils/index.js';

export async function createApp({ expressModule = null, morganModule = null, loggerFormat = process.env.MORGAN_FORMAT ?? 'combined', routeOptions = {} } = {}) {
  const express = expressModule ?? (await import('express')).default;
  const morgan = morganModule ?? (await import('morgan')).default;
  const app = express();

  app.disable('x-powered-by');
  app.use(morgan(loggerFormat));
  app.use(express.json());

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
        login: 'POST /login',
        logout: 'POST /logout',
        consignments: '/consignments',
        leads: '/leads',
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
