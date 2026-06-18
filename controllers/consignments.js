import { fetchAggregatedConsignmentsList } from '../services/index.js';

export function createConsignmentController({ prisma = null } = {}) {
  return {
    async aggregatedConsignmentsList(_req, res) {
      res.json({ success: true, data: await fetchAggregatedConsignmentsList({ prisma }) });
    },
  };
}
