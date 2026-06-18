import { db } from './db.js';

const archivedWhere = (q) => ({
  status: 'archived',
  ...(q ? { OR: [{ consignmentNum: { contains: q, mode: 'insensitive' } }, { pickupAddress: { contains: q, mode: 'insensitive' } }, { dropAddress: { contains: q, mode: 'insensitive' } }] } : {}),
});

export function createArchivedController({ prisma = null } = {}) {
  return {
    async listConsignments(req, res) {
      const client = await db(prisma);
      res.json({ success: true, data: await client.consignment.findMany({ where: archivedWhere(req.query.q), orderBy: { consignmentNum: 'desc' } }) });
    },

    async archiveConsignment(req, res) {
      const client = await db(prisma);
      res.json({ success: true, data: await client.consignment.update({ where: { consignmentNum: req.params.consignmentNum }, data: { status: 'archived' } }) });
    },

    async restoreConsignment(req, res) {
      const client = await db(prisma);
      res.json({ success: true, data: await client.consignment.update({ where: { consignmentNum: req.params.consignmentNum }, data: { status: 'active' } }) });
    },
  };
}
