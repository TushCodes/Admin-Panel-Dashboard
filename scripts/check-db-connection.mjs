import 'dotenv/config';

import { closeDb, getConnection } from '../db/connection.js';

async function main() {
  try {
    const client = await getConnection();
    console.log(`Database connection successful: ${client.redactedUrl}`);
    return 0;
  } catch (error) {
    console.error('Database connection failed.');
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  } finally {
    await closeDb();
  }
}

process.exitCode = await main();