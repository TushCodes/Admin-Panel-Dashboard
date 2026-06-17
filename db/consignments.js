import { getPrismaClient } from './connection.js';

async function resolveClient(prisma) {
  return prisma ?? getPrismaClient();
}

export async function listConsignments({ limit, offset } = {}, { prisma = null } = {}) {
  const client = await resolveClient(prisma);
  return client.consignment.findMany({
    skip: offset,
    take: limit,
    orderBy: { consignmentNum: 'desc' },
  });
}

export async function createConsignment(data, { prisma = null } = {}) {
  const client = await resolveClient(prisma);
  return client.consignment.create({ data });
}

export async function getConsignmentByConsignmentNum(consignmentNum, { prisma = null } = {}) {
  const client = await resolveClient(prisma);
  return client.consignment.findUnique({ where: { consignmentNum } });
}

export async function updateConsignment(consignmentNum, data, { prisma = null } = {}) {
  const client = await resolveClient(prisma);
  return client.consignment.update({ where: { consignmentNum }, data });
}

export async function deleteConsignment(consignmentNum, { prisma = null } = {}) {
  const client = await resolveClient(prisma);
  return client.consignment.delete({ where: { consignmentNum } });
}
