import { pathToFileURL } from 'node:url';

export async function createApp({ expressModule = null, morganModule = null, loggerFormat = process.env.MORGAN_FORMAT ?? 'combined' } = {}) {
  const express = expressModule ?? (await import('express')).default;
  const morgan = morganModule ?? (await import('morgan')).default;
  const app = express();

  app.disable('x-powered-by');
  app.use(morgan(loggerFormat));
  app.use(express.json());

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'Admin Panel Dashboard API',
      endpoints: {
        health: '/health',
      },
    });
  });

  app.get('/health', (_req, res) => {
    res.json({
      success: true,
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

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
    const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code ?? 'internal_server_error',
        message: statusCode >= 500 ? 'An unexpected error occurred.' : error.message,
      },
    });
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
