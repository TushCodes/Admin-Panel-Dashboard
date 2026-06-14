import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

import express from 'express';
import morgan from 'morgan';

const frontendRoot = fileURLToPath(new URL('.', import.meta.url));
const port = process.env.FRONTEND_PORT ?? 5173;
const host = process.env.FRONTEND_HOST ?? '127.0.0.1';
const loggerFormat = process.env.MORGAN_FORMAT ?? 'combined';

const app = express();

app.disable('x-powered-by');
app.use(morgan(loggerFormat));
app.use(express.static(frontendRoot, {
  extensions: ['html'],
  index: 'index.html',
}));

app.use((_req, res) => {
  res.status(404).sendFile(join(frontendRoot, 'errors', '404.html'));
});

app.listen(port, host, () => {
  console.log(`Dummy frontend listening on http://${host}:${port}`);
});
