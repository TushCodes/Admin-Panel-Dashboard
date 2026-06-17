import { getPrismaClient } from './connection.js';

export async function getConsignments() {
  const prisma = await getPrismaClient();
  return prisma.consignment.findMany();
}
