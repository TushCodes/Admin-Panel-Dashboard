import { db } from './db.js';

const sendNotFound = (res) => res.status(404).json({ success: false, message: 'Lead not found.' });
const leadId = (req) => Number(req.params.id);

export function createLeadController({ prisma = null } = {}) {
  return {
    async list(req, res) {
      const client = await db(prisma);
      const where = req.query.q ? { OR: [{ name: { contains: req.query.q } }, { email: { contains: req.query.q } }, { phone: { contains: req.query.q } }, { subject: { contains: req.query.q } }] } : {};
      res.json({ success: true, data: await client.lead.findMany({ where, orderBy: { id: 'desc' } }) });
    },

    async create(req, res) {
      const client = await db(prisma);
      res.status(201).json({ success: true, data: await client.lead.create({ data: req.body }) });
    },

    async getById(req, res) {
      const client = await db(prisma);
      const data = await client.lead.findUnique({ where: { id: leadId(req) } });
      return data ? res.json({ success: true, data }) : sendNotFound(res);
    },

    async update(req, res) {
      const client = await db(prisma);
      res.json({ success: true, data: await client.lead.update({ where: { id: leadId(req) }, data: req.body }) });
    },
  };
}
