import { Router } from 'express';

import { createLeadController } from '../controllers/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { leadSchema, leadUpdateSchema, listQuerySchema } from '../models/schemas.js';
import { validate } from './validation.js';

export function leadRoutes(options = {}) {
  const router = Router();
  const controller = createLeadController(options);

  router.get('/', asyncHandler(controller.list));
  router.post('/', asyncHandler(controller.create));
  router.get('/:id', asyncHandler(controller.getById));
  router.patch('/:id', asyncHandler(controller.update));

  return router;
}
