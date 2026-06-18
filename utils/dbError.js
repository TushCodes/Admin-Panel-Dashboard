import { getLogger } from './logging.js';

const dbErrorLogger = getLogger('db');

export class DatabaseConnectionDisabledError extends Error {
  constructor(message = 'Database connection is disabled. Set DATABASE_URL.') {
    super(message);
    this.name = 'DatabaseConnectionDisabledError';
  }
}

export function isDatabaseConnectionEnabled() {
  return Boolean(process.env.DATABASE_URL);
}

export function ensureDatabaseConnectionEnabled() {
  if (isDatabaseConnectionEnabled()) return;
  dbErrorLogger.error('Database connection is disabled because DATABASE_URL is missing.');
  throw new DatabaseConnectionDisabledError();
}
