import { getLogger } from './logging.js';

const dbErrorLogger = getLogger('db');

export class DatabaseConnectionDisabledError extends Error {
  constructor(message = 'Database connection is disabled. Set DATABASE_URL and SECRET_KEY.') {
    super(message);
    this.name = 'DatabaseConnectionDisabledError';
  }
}

export function isDatabaseConnectionEnabled() {
  return Boolean(process.env.DATABASE_URL && process.env.SECRET_KEY);
}

export function ensureDatabaseConnectionEnabled() {
  if (isDatabaseConnectionEnabled()) return;
  dbErrorLogger.error('Database connection is disabled because DATABASE_URL or SECRET_KEY is missing.');
  throw new DatabaseConnectionDisabledError();
}
