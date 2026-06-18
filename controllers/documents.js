import { db } from './db.js';
import { NotFoundError } from '../utils/errorHandling.js';

export function createDocumentController({ prisma = null } = {}) {
  return {
    async list(req, res) {
      const client = await db(prisma);
      const { q } = req.query;
      const where = q ? { documentUpload: { contains: q } } : {};
      const items = await client.document.findMany({ where, orderBy: { id: 'desc' } });
      res.json({ success: true, data: items });
    },

    async create(req, res) {
      const client = await db(prisma);
      const item = await client.document.create({ data: req.body });
      res.status(201).json({ success: true, message: 'Document created.', data: item });
    },

    async getById(req, res) {
      const client = await db(prisma);
      const item = await client.document.findUnique({ where: { id: Number(req.params.id) } });
      if (!item) throw new NotFoundError('Document not found.');
      res.json({ success: true, data: item });
    },

    async update(req, res) {
      const client = await db(prisma);
      const item = await client.document.update({ where: { id: Number(req.params.id) }, data: req.body });
      res.json({ success: true, message: 'Document updated.', data: item });
    },
  };
}
