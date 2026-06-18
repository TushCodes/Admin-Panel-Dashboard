import { db } from './db.js';

export function createArchivedController({ prisma = null } = {}) {
  return {
    async listConsignments(_req, res) {
      const client = await db(prisma);
      res.json({ success: true, data: await client.consignment.findMany({ where: { status: 'archived' }, orderBy: { consignmentNum: 'desc' } }) });
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
