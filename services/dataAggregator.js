import { fetchExternalApiRecords } from '../api/index.js';
import { fetchConsignmentList } from '../db/consignments.js';
import { BadRequestError } from '../utils/errorHandling.js';

export const DATA_SOURCES = Object.freeze({
  CONSIGNMENTS: 'consignments',
  EXTERNAL_APIS: 'externalApis',
});

export const CONSIGNMENT_RECORD_FIELDS = Object.freeze([
  'consignmentNum',
  'status',
  'pickupAddress',
  'pickupPincode',
  'pickupTag',
  'pickupDate',
  'dropAddress',
  'dropPincode',
  'dropTag',
  'dropDate',
]);

function toAggregatedItem(record, source) {
  return {
    source,
    ...record,
  };
}

function getConsignmentFormatDiff(record) {
  const recordFields = Object.keys(record ?? {});
  const expectedFields = new Set(CONSIGNMENT_RECORD_FIELDS);
  const actualFields = new Set(recordFields);

  return {
    missingFields: CONSIGNMENT_RECORD_FIELDS.filter((field) => !actualFields.has(field)),
    unexpectedFields: recordFields.filter((field) => !expectedFields.has(field)),
  };
}

export function validateExternalApiRecordFormat(record, index = 0) {
  const { missingFields, unexpectedFields } = getConsignmentFormatDiff(record);

  if (missingFields.length > 0 || unexpectedFields.length > 0) {
    throw new BadRequestError('External API record format must match consignment records.', {
      code: 'external_api_format_mismatch',
      details: {
        index,
        missingFields,
        unexpectedFields,
      },
    });
  }

  return record;
}

export async function fetchAggregatedExternalApiList(options = {}) {
  const records = await fetchExternalApiRecords(options);
  return records.map((record, index) => (
    toAggregatedItem(validateExternalApiRecordFormat(record, index), DATA_SOURCES.EXTERNAL_APIS)
  ));
}

export async function fetchAggregatedConsignmentsList(options = {}) {
  const [consignments, externalApiRecords] = await Promise.all([
    fetchConsignmentList(options),
    fetchAggregatedExternalApiList(options),
  ]);

  return [
    ...consignments.map((record) => toAggregatedItem(record, DATA_SOURCES.CONSIGNMENTS)),
    ...externalApiRecords,
  ];
}
