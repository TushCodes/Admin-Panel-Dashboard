import { Router } from 'express';

import { createLeadController } from '../controllers/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { leadSchema, leadUpdateSchema, listQuerySchema } from './schemas.js';
import { validate } from './validation.js';

export function leadRoutes(options = {}) {
  const router = Router();
  const controller = createLeadController(options);

  router.get('/', validate(listQuerySchema, 'query'), asyncHandler(controller.list));
  router.post('/', validate(leadSchema), asyncHandler(controller.create));
  router.get('/:id', asyncHandler(controller.getById));
  router.patch('/:id', validate(leadUpdateSchema), asyncHandler(controller.update));

  return router;
}
