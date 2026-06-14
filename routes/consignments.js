import { Router } from 'express';

import { getPrismaClient } from '../db/index.js';
import { asyncHandler } from '../utils/index.js';
import { NotFoundError } from '../utils/errorHandling.js';
import { consignmentSchema, consignmentUpdateSchema, listQuerySchema } from '../validation/schemas.js';
import { validate } from './validation.js';

const db = async (client) => client ?? getPrismaClient();

export function consignmentRoutes({ prisma = null } = {}) {
  const router = Router();

  router.get('/', validate(listQuerySchema, 'query'), asyncHandler(async (req, res) => {
    const client = await db(prisma);
    const { limit, offset, status, q } = req.query;
    const where = { ...(status ? { status } : {}), ...(q ? { OR: [{ consignmentNum: { contains: q } }, { pickupAddress: { contains: q } }, { dropAddress: { contains: q } }] } : {}) };
    const [items, total] = await Promise.all([
      client.consignment.findMany({ where, skip: offset, take: limit, orderBy: { consignmentNum: 'desc' } }),
      client.consignment.count({ where }),
    ]);
    res.json({ success: true, data: items, metadata: { total, limit, offset } });
  }));

  router.post('/', validate(consignmentSchema), asyncHandler(async (req, res) => {
    const client = await db(prisma);
    const item = await client.consignment.create({ data: req.body });
    res.status(201).json({ success: true, message: 'Consignment created.', data: item });
  }));

  router.get('/:consignmentNum', asyncHandler(async (req, res) => {
    const client = await db(prisma);
    const item = await client.consignment.findUnique({ where: { consignmentNum: req.params.consignmentNum } });
    if (!item) throw new NotFoundError('Consignment not found.');
    res.json({ success: true, data: item });
  }));

  router.patch('/:consignmentNum', validate(consignmentUpdateSchema), asyncHandler(async (req, res) => {
    const client = await db(prisma);
    const item = await client.consignment.update({ where: { consignmentNum: req.params.consignmentNum }, data: req.body });
    res.json({ success: true, message: 'Consignment updated.', data: item });
  }));

  return router;
}
