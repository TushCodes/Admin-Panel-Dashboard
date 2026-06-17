import { getPrismaClient } from './connection.js';

export async function getConsignments({ prisma = null } = {}) {
  const client = prisma ?? await getPrismaClient();
  return client.consignment.findMany();
}
