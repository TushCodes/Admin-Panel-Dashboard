import { db } from './db.js';

const sendNotFound = (res) => res.status(404).json({ success: false, message: 'Consignment not found.' });

export function createConsignmentController({ prisma = null } = {}) {
  return {
    async list(req, res) {
      const client = await db(prisma);
      const where = req.query.status ? { status: req.query.status } : {};
      res.json({ success: true, data: await client.consignment.findMany({ where, orderBy: { consignmentNum: 'desc' } }) });
    },

    async create(req, res) {
      const client = await db(prisma);
      res.status(201).json({ success: true, data: await client.consignment.create({ data: req.body }) });
    },

    async getByConsignmentNum(req, res) {
      const client = await db(prisma);
      const data = await client.consignment.findUnique({ where: { consignmentNum: req.params.consignmentNum } });
      return data ? res.json({ success: true, data }) : sendNotFound(res);
    },

    async update(req, res) {
      const client = await db(prisma);
      res.json({ success: true, data: await client.consignment.update({ where: { consignmentNum: req.params.consignmentNum }, data: req.body }) });
    },
  };
}
