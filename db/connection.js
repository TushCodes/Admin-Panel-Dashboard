import { ensureDatabaseConnectionEnabled } from '../utils/dbError.js';

export const DATABASE_URL_ENV_NAMES = ['DATABASE_URL'];
export const SECRET_KEY_ENV_NAMES = ['SECRET_KEY'];
let cachedConnection = null;

export function redactedDatabaseUrl(databaseUrl) {
  try {
    const url = new URL(databaseUrl);
    if (url.password) url.password = '***';
    return url.toString();
  } catch {
    return '<invalid database URL>';
  }
}

export function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) return databaseUrl;
  throw new Error('Set DATABASE_URL for the database connection.');
}

export function getSecretKey() {
  const secretKey = process.env.SECRET_KEY;
  if (secretKey) return secretKey;
  throw new Error('Set SECRET_KEY for the secret key.');
}

export async function getConnection({ connector = null } = {}) {
  ensureDatabaseConnectionEnabled();
  if (cachedConnection) return cachedConnection;
  const databaseUrl = getDatabaseUrl();
  if (!connector) {
    cachedConnection = { databaseUrl, redactedUrl: redactedDatabaseUrl(databaseUrl), connected: false };
    return cachedConnection;
  }
  cachedConnection = await connector(databaseUrl);
  return cachedConnection;
}

export function closeDb() {
  if (cachedConnection && typeof cachedConnection.end === 'function') cachedConnection.end();
  cachedConnection = null;
}

export async function withDb(callback, options = {}) {
  const db = await getConnection(options);
  return callback(db);
}

export async function initDb() {
  await getConnection();
}
