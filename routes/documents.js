import { Router } from 'express';

import { createDocumentController } from '../controllers/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export function documentRoutes(options = {}) {
  const router = Router();
  const controller = createDocumentController(options);

  router.get('/', asyncHandler(controller.list));
  router.post('/', asyncHandler(controller.create));
  router.get('/:id', asyncHandler(controller.getById));
  router.patch('/:id', asyncHandler(controller.update));

  return router;
}
