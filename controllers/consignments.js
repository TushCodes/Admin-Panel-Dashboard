import { fetchAggregatedConsignmentsList } from '../services/index.js';
import { mutateConsignment } from '../db/index.js';

const MUTATION_STATUS = {
  create: 201,
  update: 200,
  delete: 200,
};

export function consignmentMutationRequest({ action, req }) {
  return {
    action,
    consignmentNum: req.params?.consignmentNum ?? req.body?.consignmentNum ?? null,
    payload: req.body ?? {},
  };
}

export function createConsignmentController({ prisma = null } = {}) {
  const handleMutation = (action) => async (req, res) => {
    const data = await mutateConsignment(consignmentMutationRequest({ action, req }), { prisma });
    res.status(MUTATION_STATUS[action]).json({ success: true, data });
  };

  return {
    async aggregatedConsignmentsList(_req, res) {
      res.json({ success: true, data: await fetchAggregatedConsignmentsList({ prisma }) });
    },

    create: handleMutation('create'),
    update: handleMutation('update'),
    delete: handleMutation('delete'),
  };
}
