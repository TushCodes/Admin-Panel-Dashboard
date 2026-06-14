import { Router } from 'express';

import { getPrismaClient } from '../db/index.js';
import { asyncHandler } from '../utils/index.js';
import { listQuerySchema } from '../validation/schemas.js';
import { validate } from './validation.js';

const db = async (client) => client ?? getPrismaClient();
const archivedWhere = (extra = {}) => ({ status: 'archived', ...extra });

export function archivedRoutes({ prisma = null } = {}) {
  const router = Router();

  router.get('/consignments', validate(listQuerySchema, 'query'), asyncHandler(async (req, res) => {
    const client = await db(prisma);
    const { limit, offset, q } = req.query;
    const search = q ? { OR: [{ consignmentNum: { contains: q } }, { pickupAddress: { contains: q } }, { dropAddress: { contains: q } }] } : {};
    const where = archivedWhere(search);
    const [items, total] = await Promise.all([
      client.consignment.findMany({ where, skip: offset, take: limit, orderBy: { consignmentNum: 'desc' } }),
      client.consignment.count({ where }),
    ]);
    res.json({ success: true, data: items, metadata: { total, limit, offset } });
  }));

  router.post('/consignments/:consignmentNum', asyncHandler(async (req, res) => {
    const client = await db(prisma);
    const item = await client.consignment.update({ where: { consignmentNum: req.params.consignmentNum }, data: { status: 'archived' } });
    res.json({ success: true, message: 'Consignment archived.', data: item });
  }));

  router.post('/consignments/:consignmentNum/restore', asyncHandler(async (req, res) => {
    const client = await db(prisma);
    const item = await client.consignment.update({ where: { consignmentNum: req.params.consignmentNum }, data: { status: 'active' } });
    res.json({ success: true, message: 'Consignment restored.', data: item });
  }));

  return router;
}
