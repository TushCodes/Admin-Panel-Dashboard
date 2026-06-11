import assert from 'node:assert/strict';
import test from 'node:test';

import { closeDb, getConnection, getDatabaseUrl, redactedDatabaseUrl } from '../db/connection.js';

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

test('getConnection lazily returns connection metadata when enabled', async () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalSecretKey = process.env.SECRET_KEY;
  process.env.DATABASE_URL = 'postgresql://user:secret@db.example.com:5432/postgres';
  process.env.SECRET_KEY = 'secret';
  closeDb();
  const connection = await getConnection();
  assert.equal(connection.connected, false);
  assert.match(connection.redactedUrl, /\*\*\*/);
  closeDb();
  if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = originalDatabaseUrl;
  if (originalSecretKey === undefined) delete process.env.SECRET_KEY; else process.env.SECRET_KEY = originalSecretKey;
});
