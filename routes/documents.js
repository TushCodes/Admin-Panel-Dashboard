import { Router } from 'express';

import { getPrismaClient } from '../db/index.js';
import { asyncHandler } from '../utils/index.js';
import { NotFoundError } from '../utils/errorHandling.js';
import { documentSchema, documentUpdateSchema, listQuerySchema } from '../validation/schemas.js';
import { validate } from './validation.js';

const db = async (client) => client ?? getPrismaClient();

export function documentRoutes({ prisma = null } = {}) {
  const router = Router();

  router.get('/', validate(listQuerySchema, 'query'), asyncHandler(async (req, res) => {
    const client = await db(prisma);
    const { limit, offset, q } = req.query;
    const where = q ? { documentUpload: { contains: q } } : {};
    const [items, total] = await Promise.all([
      client.document.findMany({ where, skip: offset, take: limit, orderBy: { id: 'desc' } }),
      client.document.count({ where }),
    ]);
    res.json({ success: true, data: items, metadata: { total, limit, offset } });
  }));

  router.post('/', validate(documentSchema), asyncHandler(async (req, res) => {
    const client = await db(prisma);
    const item = await client.document.create({ data: req.body });
    res.status(201).json({ success: true, message: 'Document created.', data: item });
  }));

  router.get('/:id', asyncHandler(async (req, res) => {
    const client = await db(prisma);
    const item = await client.document.findUnique({ where: { id: Number(req.params.id) } });
    if (!item) throw new NotFoundError('Document not found.');
    res.json({ success: true, data: item });
  }));

  router.patch('/:id', validate(documentUpdateSchema), asyncHandler(async (req, res) => {
    const client = await db(prisma);
    const item = await client.document.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json({ success: true, message: 'Document updated.', data: item });
  }));

  return router;
}
