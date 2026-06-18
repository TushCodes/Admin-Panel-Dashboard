import { fetchConsignmentList } from '../db/consignments.js';

export const DATA_SOURCES = Object.freeze({
  CONSIGNMENTS: 'consignments',
});

function toAggregatedItem(record, source) {
  return {
    source,
    ...record,
  };
}

export async function fetchAggregatedConsignmentsList(options = {}) {
  const consignments = await fetchConsignmentList(options);
  return consignments.map((record) => toAggregatedItem(record, DATA_SOURCES.CONSIGNMENTS));
}
