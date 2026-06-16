import { db } from './db.js';

const archivedWhere = (extra = {}) => ({ status: 'archived', ...extra });

export function createArchivedController({ prisma = null } = {}) {
  return {
    async listConsignments(req, res) {
      const client = await db(prisma);
      const { limit, offset, q } = req.query;
      const search = q ? { OR: [{ consignmentNum: { contains: q } }, { pickupAddress: { contains: q } }, { dropAddress: { contains: q } }] } : {};
      const where = archivedWhere(search);
      const [items, total] = await Promise.all([
        client.consignment.findMany({ where, skip: offset, take: limit, orderBy: { consignmentNum: 'desc' } }),
        client.consignment.count({ where }),
      ]);
      res.json({ success: true, data: items, metadata: { total, limit, offset } });
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
