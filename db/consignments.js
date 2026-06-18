import { withDb } from './connection.js';

export const CONSIGNMENT_LIST_ORDER = { consignmentNum: 'desc' };

export async function fetchConsignmentList({ prisma = null, ...connectionOptions } = {}) {
  const fetchAll = (client) => client.consignment.findMany({ orderBy: CONSIGNMENT_LIST_ORDER });
  return prisma ? fetchAll(prisma) : withDb(fetchAll, connectionOptions);
}
