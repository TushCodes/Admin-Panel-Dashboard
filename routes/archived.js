import { Router } from 'express';

import { createArchivedController } from '../controllers/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listQuerySchema } from '../models/schemas.js';
import { validate } from './validation.js';

export function archivedRoutes(options = {}) {
  const router = Router();
  const controller = createArchivedController(options);

  router.get('/consignments', validate(listQuerySchema, 'query'), asyncHandler(controller.listConsignments));
  router.post('/consignments/:consignmentNum', asyncHandler(controller.archiveConsignment));
  router.post('/consignments/:consignmentNum/restore', asyncHandler(controller.restoreConsignment));

  return router;
}
