import { db } from './db.js';
import { NotFoundError } from '../utils/errorHandling.js';

export function createConsignmentController({ prisma = null } = {}) {
  return {
    async list(req, res) {
      const client = await db(prisma);
      const { status, q } = req.query;
      const where = { ...(status ? { status } : {}), ...(q ? { OR: [{ consignmentNum: { contains: q } }, { pickupAddress: { contains: q } }, { dropAddress: { contains: q } }] } : {}) };
      const items = await client.consignment.findMany({ where, orderBy: { consignmentNum: 'desc' } });
      res.json({ success: true, data: items });
    },

    async create(req, res) {
      const client = await db(prisma);
      const item = await client.consignment.create({ data: req.body });
      res.status(201).json({ success: true, message: 'Consignment created.', data: item });
    },

    async getByConsignmentNum(req, res) {
      const client = await db(prisma);
      const item = await client.consignment.findUnique({ where: { consignmentNum: req.params.consignmentNum } });
      if (!item) throw new NotFoundError('Consignment not found.');
      res.json({ success: true, data: item });
    },

    async update(req, res) {
      const client = await db(prisma);
      const item = await client.consignment.update({ where: { consignmentNum: req.params.consignmentNum }, data: req.body });
      res.json({ success: true, message: 'Consignment updated.', data: item });
    },
  };
}
