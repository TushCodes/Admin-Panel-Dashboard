import { Router } from 'express';

import { createConsignmentController } from '../controllers/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export function consignmentRoutes(options = {}) {
  const router = Router();
  const controller = createConsignmentController(options);

  router.get('/aggregated-consignments', asyncHandler(controller.aggregatedConsignmentsList));

  return router;
}
