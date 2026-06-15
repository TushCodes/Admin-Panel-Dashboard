import { archivedRoutes } from './archived.js';
import { consignmentRoutes } from './consignments.js';
import { leadRoutes } from './leads.js';

export { consignmentRoutes } from './consignments.js';
export { leadRoutes } from './leads.js';
export { archivedRoutes } from './archived.js';

export const API_PREFIX = '/api/v1';

export function registerRoutes(app, options = {}) {
  app.use(`${API_PREFIX}/consignments`, options.consignmentRoutes ?? options.consignments ?? consignmentRoutes(options));
  app.use(`${API_PREFIX}/leads`, options.leadRoutes ?? options.leads ?? leadRoutes(options));
  app.use(`${API_PREFIX}/archived`, options.archivedRoutes ?? options.archived ?? archivedRoutes(options));
  return app;
}
