import { db } from './db.js';

const archivedWhere = (extra = {}) => ({ status: 'archived', ...extra });

export function createArchivedController({ prisma = null } = {}) {
  return {
    async listConsignments(req, res) {
      const client = await db(prisma);
      const { q } = req.query;
      const search = q ? { OR: [{ consignmentNum: { contains: q } }, { pickupAddress: { contains: q } }, { dropAddress: { contains: q } }] } : {};
      const where = archivedWhere(search);
      const items = await client.consignment.findMany({ where, orderBy: { consignmentNum: 'desc' } });
      res.json({ success: true, data: items });
    },

    async archiveConsignment(req, res) {
      const client = await db(prisma);
      const item = await client.consignment.update({ where: { consignmentNum: req.params.consignmentNum }, data: { status: 'archived' } });
      res.json({ success: true, message: 'Consignment archived.', data: item });
    },

    async restoreConsignment(req, res) {
      const client = await db(prisma);
      const item = await client.consignment.update({ where: { consignmentNum: req.params.consignmentNum }, data: { status: 'active' } });
      res.json({ success: true, message: 'Consignment restored.', data: item });
    },
  };
}
