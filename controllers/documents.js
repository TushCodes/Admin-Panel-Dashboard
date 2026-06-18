import { db } from './db.js';

const sendNotFound = (res) => res.status(404).json({ success: false, message: 'Document not found.' });
const documentId = (req) => Number(req.params.id);

export function createDocumentController({ prisma = null } = {}) {
  return {
    async list(req, res) {
      const client = await db(prisma);
      const where = req.query.q ? { documentUpload: { contains: req.query.q } } : {};
      res.json({ success: true, data: await client.document.findMany({ where, orderBy: { id: 'desc' } }) });
    },

    async create(req, res) {
      const client = await db(prisma);
      res.status(201).json({ success: true, data: await client.document.create({ data: req.body }) });
    },

    async getById(req, res) {
      const client = await db(prisma);
      const data = await client.document.findUnique({ where: { id: documentId(req) } });
      return data ? res.json({ success: true, data }) : sendNotFound(res);
    },

    async update(req, res) {
      const client = await db(prisma);
      res.json({ success: true, data: await client.document.update({ where: { id: documentId(req) }, data: req.body }) });
    },
  };
}
