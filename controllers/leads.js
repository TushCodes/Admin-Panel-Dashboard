import { db } from './db.js';

const sendNotFound = (res) => res.status(404).json({ success: false, message: 'Lead not found.' });

export function createLeadController({ prisma = null } = {}) {
  return {
    async list(_req, res) {
      const client = await db(prisma);
      res.json({ success: true, data: await client.lead.findMany({ orderBy: { id: 'desc' } }) });
    },

    async create(req, res) {
      const client = await db(prisma);
      res.status(201).json({ success: true, data: await client.lead.create({ data: req.body }) });
    },

    async getById(req, res) {
      if (!req.params.id) {
        return res.status(400).json({ message: 'ID is required' });
      }
      const client = await db(prisma);
      const data = await client.lead.findUnique({ where: { id: req.params.id } });
      return data ? res.json({ success: true, data }) : sendNotFound(res);
    },

    async update(req, res) {
      if (!req.params.id) {
        return res.status(400).json({ message: 'ID is required' });
      }
      const client = await db(prisma);
      res.json({ success: true, data: await client.lead.update({ where: { id: req.params.id }, data: req.body }) });
    },
  };
}
