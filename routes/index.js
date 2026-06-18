import { consignmentRoutes } from './consignments.js';
import { documentRoutes } from './documents.js';
import { leadRoutes } from './leads.js';

export { consignmentRoutes } from './consignments.js';
export { leadRoutes } from './leads.js';
export { documentRoutes } from './documents.js';

export function registerRoutes(app, options = {}) {
  app.use('/consignments', options.consignmentRoutes ?? options.consignments ?? consignmentRoutes(options));
  app.use('/leads', options.leadRoutes ?? options.leads ?? leadRoutes(options));
  app.use('/documents', options.documentRoutes ?? options.documents ?? documentRoutes(options));
  return app;
}
