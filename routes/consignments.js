import { Router } from 'express';

import { createConsignmentController } from '../controllers/index.js';
import { asyncHandler } from '../utils/index.js';
import { consignmentSchema, consignmentUpdateSchema, listQuerySchema } from '../validation/schemas.js';
import { validate } from './validation.js';

export function consignmentRoutes(options = {}) {
  const router = Router();
  const controller = createConsignmentController(options);

  router.get('/', validate(listQuerySchema, 'query'), asyncHandler(controller.list));
  router.post('/', validate(consignmentSchema), asyncHandler(controller.create));
  router.get('/:consignmentNum', asyncHandler(controller.getByConsignmentNum));
  router.patch('/:consignmentNum', validate(consignmentUpdateSchema), asyncHandler(controller.update));

  return router;
}
