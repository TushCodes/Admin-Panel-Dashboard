import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import express from 'express';
import morgan from 'morgan';

const frontendSourceRoot = fileURLToPath(new URL('.', import.meta.url));
const frontendDistRoot = join(dirname(frontendSourceRoot), 'frontend', 'dist');
const frontendRoot = existsSync(frontendDistRoot) ? frontendDistRoot : frontendSourceRoot;
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

app.use((req, res) => {
  if (req.accepts('html') && !req.path.includes('.')) {
    return res.sendFile(join(frontendRoot, 'index.html'));
  }

  return res.status(404).send('Not found');
});

app.listen(port, host, () => {
  console.log(`MVP frontend listening on http://${host}:${port}`);
});
