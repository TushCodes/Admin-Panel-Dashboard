import { Router } from 'express';

import { createDocumentController } from '../controllers/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { documentSchema, documentUpdateSchema, listQuerySchema } from './schemas.js';
import { validate } from './validation.js';

export function documentRoutes(options = {}) {
  const router = Router();
  const controller = createDocumentController(options);

  router.get('/', validate(listQuerySchema, 'query'), asyncHandler(controller.list));
  router.post('/', validate(documentSchema), asyncHandler(controller.create));
  router.get('/:id', asyncHandler(controller.getById));
  router.patch('/:id', validate(documentUpdateSchema), asyncHandler(controller.update));

  return router;
}
