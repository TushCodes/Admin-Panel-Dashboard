import assert from 'node:assert/strict';
import test from 'node:test';

import { closeDb, getConnection, getDatabaseUrl, getPrismaClient, redactedDatabaseUrl, withDb } from '../db/connection.js';

class FakePrismaPg {
  constructor(options) {
    this.options = options;
  }
}

class FakePrismaClient {
  constructor(options) {
    this.options = options;
    this.connectedByClient = false;
    this.disconnectedByClient = false;
    this.consignment = { findMany: async () => [] };
  }

  async $connect() {
    this.connectedByClient = true;
  }

  async $disconnect() {
    this.disconnectedByClient = true;
  }
}

function restoreEnv(originalDatabaseUrl, originalSecretKey) {
  if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = originalDatabaseUrl;
  if (originalSecretKey === undefined) delete process.env.SECRET_KEY; else process.env.SECRET_KEY = originalSecretKey;
}

test('getDatabaseUrl returns configured database URL', () => {
  const original = process.env.DATABASE_URL;
  process.env.DATABASE_URL = 'postgresql://user:secret@db.example.com:5432/postgres';
  assert.equal(getDatabaseUrl(), 'postgresql://user:secret@db.example.com:5432/postgres');
  if (original === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = original;
});

test('getDatabaseUrl raises when no URL is configured', () => {
  const original = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  assert.throws(() => getDatabaseUrl(), /DATABASE_URL/);
  if (original === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = original;
});

test('redactedDatabaseUrl hides passwords', () => {
  assert.equal(redactedDatabaseUrl('postgresql://user:secret@db.example.com:5432/postgres'), 'postgresql://user:***@db.example.com:5432/postgres');
});

test('getPrismaClient creates and caches a connected Prisma Client', async () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalSecretKey = process.env.SECRET_KEY;
  process.env.DATABASE_URL = 'postgresql://user:secret@db.example.com:5432/postgres';
  process.env.SECRET_KEY = 'secret';
  await closeDb();

  const prisma = await getPrismaClient({ PrismaClient: FakePrismaClient, PrismaPg: FakePrismaPg });
  assert.equal(prisma.connectedByClient, true);
  assert.equal(prisma.connected, true);
  assert.match(prisma.redactedUrl, /\*\*\*/);
  assert.deepEqual(prisma.options.adapter.options, { connectionString: process.env.DATABASE_URL });
  assert.equal(await getConnection({ PrismaClient: FakePrismaClient, PrismaPg: FakePrismaPg }), prisma);

  await closeDb();
  assert.equal(prisma.disconnectedByClient, true);
  restoreEnv(originalDatabaseUrl, originalSecretKey);
});

test('withDb passes the Prisma Client to callbacks', async () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalSecretKey = process.env.SECRET_KEY;
  process.env.DATABASE_URL = 'postgresql://user:secret@db.example.com:5432/postgres';
  process.env.SECRET_KEY = 'secret';
  await closeDb();

  const rows = await withDb((prisma) => prisma.consignment.findMany(), { PrismaClient: FakePrismaClient, PrismaPg: FakePrismaPg });
  assert.deepEqual(rows, []);

  await closeDb();
  restoreEnv(originalDatabaseUrl, originalSecretKey);
});
