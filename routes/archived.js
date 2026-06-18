import { Router } from 'express';

import { createArchivedController } from '../controllers/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export function archivedRoutes(options = {}) {
  const router = Router();
  const controller = createArchivedController(options);

  router.get('/consignments', asyncHandler(controller.listConsignments));
  router.post('/consignments/:consignmentNum', asyncHandler(controller.archiveConsignment));
  router.post('/consignments/:consignmentNum/restore', asyncHandler(controller.restoreConsignment));

  return router;
}
