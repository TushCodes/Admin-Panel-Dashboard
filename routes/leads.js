import { Router } from 'express';

import { getPrismaClient } from '../db/index.js';
import { asyncHandler } from '../utils/index.js';
import { NotFoundError } from '../utils/errorHandling.js';
import { leadSchema, leadUpdateSchema, listQuerySchema } from '../validation/schemas.js';
import { validate } from './validation.js';

const db = async (client) => client ?? getPrismaClient();

export function leadRoutes({ prisma = null } = {}) {
  const router = Router();

  router.get('/', validate(listQuerySchema, 'query'), asyncHandler(async (req, res) => {
    const client = await db(prisma);
    const { limit, offset, q } = req.query;
    const where = q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }, { subject: { contains: q } }] } : {};
    const [items, total] = await Promise.all([
      client.lead.findMany({ where, skip: offset, take: limit, orderBy: { id: 'desc' } }),
      client.lead.count({ where }),
    ]);
    res.json({ success: true, data: items, metadata: { total, limit, offset } });
  }));

  router.post('/', validate(leadSchema), asyncHandler(async (req, res) => {
    const client = await db(prisma);
    const item = await client.lead.create({ data: req.body });
    res.status(201).json({ success: true, message: 'Lead created.', data: item });
  }));

  router.get('/:id', asyncHandler(async (req, res) => {
    const client = await db(prisma);
    const item = await client.lead.findUnique({ where: { id: Number(req.params.id) } });
    if (!item) throw new NotFoundError('Lead not found.');
    res.json({ success: true, data: item });
  }));

  router.patch('/:id', validate(leadUpdateSchema), asyncHandler(async (req, res) => {
    const client = await db(prisma);
    const item = await client.lead.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json({ success: true, message: 'Lead updated.', data: item });
  }));

  return router;
}
