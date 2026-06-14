import { archivedRoutes } from './archived.js';
import { authRoutes } from './auth.js';
import { consignmentRoutes } from './consignments.js';
import { leadRoutes } from './leads.js';

export { archivedRoutes } from './archived.js';
export { authRoutes } from './auth.js';
export { consignmentRoutes } from './consignments.js';
export { leadRoutes } from './leads.js';

export const routes = [
  ...authRoutes,
  ...consignmentRoutes,
  ...leadRoutes,
  ...archivedRoutes,
];
