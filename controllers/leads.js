import { db } from './db.js';
import { NotFoundError } from '../utils/errorHandling.js';

export function createLeadController({ prisma = null } = {}) {
  return {
    async list(req, res) {
      const client = await db(prisma);
      const { q } = req.query;
      const where = q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }, { subject: { contains: q } }] } : {};
      const items = await client.lead.findMany({ where, orderBy: { id: 'desc' } });
      res.json({ success: true, data: items });
    },

    async create(req, res) {
      const client = await db(prisma);
      const item = await client.lead.create({ data: req.body });
      res.status(201).json({ success: true, message: 'Lead created.', data: item });
    },

    async getById(req, res) {
      const client = await db(prisma);
      const item = await client.lead.findUnique({ where: { id: Number(req.params.id) } });
      if (!item) throw new NotFoundError('Lead not found.');
      res.json({ success: true, data: item });
    },

    async update(req, res) {
      const client = await db(prisma);
      const item = await client.lead.update({ where: { id: Number(req.params.id) }, data: req.body });
      res.json({ success: true, message: 'Lead updated.', data: item });
    },
  };
}
