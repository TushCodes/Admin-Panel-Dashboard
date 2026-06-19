import { ensureDatabaseConnectionEnabled } from '../utils/dbError.js';

export const DATABASE_URL_ENV_NAMES = ['DATABASE_URL'];
let cachedClient = null;

export function redactedDatabaseUrl(databaseUrl) {
  try {
    // converts dbUrl to URL object, redacts the password and returns the string
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

async function loadPrismaClientClass() {
  const prismaModule = await import('../models/generated/client/client.ts');
  return prismaModule.PrismaClient;
}

async function loadPrismaPgAdapterClass() {
  const adapterModule = await import('@prisma/adapter-pg');
  return adapterModule.PrismaPg;
}

async function createPrismaAdapter(databaseUrl, { PrismaPg = null, adapter = null } = {}) {
  if (adapter) return adapter;
  const Adapter = PrismaPg ?? await loadPrismaPgAdapterClass();
  return new Adapter({ connectionString: databaseUrl });
}

function annotatePrismaClient(client, databaseUrl) {
  Object.defineProperties(client, {
    databaseUrl: { value: databaseUrl, enumerable: false },
    redactedUrl: { value: redactedDatabaseUrl(databaseUrl), enumerable: false },
    connected: { value: true, enumerable: true },
  });
  return client;
}

export async function getPrismaClient({ PrismaClient = null, PrismaPg = null, adapter = null } = {}) {
  ensureDatabaseConnectionEnabled();
  if (cachedClient) return cachedClient;

  const databaseUrl = getDatabaseUrl();
  const Client = PrismaClient ?? await loadPrismaClientClass();
  const prismaAdapter = await createPrismaAdapter(databaseUrl, { PrismaPg, adapter });
  const client = new Client({ adapter: prismaAdapter });

  if (typeof client.$connect === 'function') await client.$connect();
  cachedClient = annotatePrismaClient(client, databaseUrl);
  return cachedClient;
}

export async function getConnection(options = {}) {
  return getPrismaClient(options);
}

export async function closeDb() {
  const client = cachedClient;
  cachedClient = null;
  if (client && typeof client.$disconnect === 'function') await client.$disconnect();
}

export async function withDb(callback, options = {}) {
  const prisma = await getPrismaClient(options);
  return callback(prisma);
}

export async function initDb(options = {}) {
  await getPrismaClient(options);
}
