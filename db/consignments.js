import { getPrismaClient } from './connection.js';

function buildConsignmentWhere({ status, q } = {}) {
  return {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { consignmentNum: { contains: q } },
            { pickupAddress: { contains: q } },
            { dropAddress: { contains: q } },
          ],
        }
      : {}),
  };
}

async function resolveClient(prisma) {
  return prisma ?? getPrismaClient();
}

export async function listConsignments({ limit, offset, status, q } = {}, { prisma = null } = {}) {
  const client = await resolveClient(prisma);
  const where = buildConsignmentWhere({ status, q });
  const [items, total] = await Promise.all([
    client.consignment.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { consignmentNum: 'desc' },
    }),
    client.consignment.count({ where }),
  ]);

  return { items, total };
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
