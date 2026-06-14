import { archivedRoutes } from './archived.js';
import { authRoutes } from './auth.js';
import { consignmentRoutes } from './consignments.js';
import { leadRoutes } from './leads.js';

export { authRoutes } from './auth.js';
export { consignmentRoutes } from './consignments.js';
export { leadRoutes } from './leads.js';
export { archivedRoutes } from './archived.js';

export function registerRoutes(app, options = {}) {
  app.use('/', options.authRoutes ?? options.auth ?? authRoutes(options));
  app.use('/consignments', options.consignmentRoutes ?? options.consignments ?? consignmentRoutes(options));
  app.use('/leads', options.leadRoutes ?? options.leads ?? leadRoutes(options));
  app.use('/archived', options.archivedRoutes ?? options.archived ?? archivedRoutes(options));
  return app;
}
