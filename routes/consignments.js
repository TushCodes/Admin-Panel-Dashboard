 import { Router } from 'express';
 
 import { createConsignmentController } from '../controllers/index.js';
 import { asyncHandler } from '../utils/asyncHandler.js';
 
 export function consignmentRoutes(options = {}) {
   const router = Router();
   const controller = createConsignmentController(options);
 
   router.get('/', asyncHandler(controller.list));
   router.post('/', asyncHandler(controller.create));
   router.get('/:consignmentNum', asyncHandler(controller.getByConsignmentNum));
   router.patch('/:consignmentNum', asyncHandler(controller.update));
 
   return router;
 }
 
)
