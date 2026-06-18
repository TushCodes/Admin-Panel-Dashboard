import { ConflictError, BadRequestError, NotFoundError } from '../utils/errorHandling.js';
import { withDb } from './connection.js';

export const CONSIGNMENT_LIST_ORDER = { consignmentNum: 'desc' };
export const CONSIGNMENT_MUTATION_OPERATIONS = new Set(['create', 'update', 'delete']);
export const CONSIGNMENT_WRITABLE_FIELDS = [
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
];

const DATE_FIELDS = new Set(['pickupDate', 'dropDate']);

export async function fetchConsignmentList({ prisma = null, ...connectionOptions } = {}) {
  const fetchAll = (client) => client.consignment.findMany({ orderBy: CONSIGNMENT_LIST_ORDER });
  return prisma ? fetchAll(prisma) : withDb(fetchAll, connectionOptions);
}

function requireConsignmentNum(consignmentNum, action) {
  if (typeof consignmentNum !== 'string' || consignmentNum.trim() === '') {
    throw new BadRequestError(`consignmentNum is required to ${action} a consignment.`);
  }
  return consignmentNum.trim();
}

function sanitizeConsignmentData(payload = {}, { requireNumber = false, allowEmpty = false } = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new BadRequestError('Consignment payload must be a JSON object.');
  }

  const data = {};
  for (const field of CONSIGNMENT_WRITABLE_FIELDS) {
    if (!(field in payload)) continue;
    const value = payload[field];
    data[field] = DATE_FIELDS.has(field) && value !== null && value !== undefined && value !== ''
      ? new Date(value)
      : value;

    if (DATE_FIELDS.has(field) && data[field] instanceof Date && Number.isNaN(data[field].getTime())) {
      throw new BadRequestError(`${field} must be a valid date.`);
    }
  }

  if (requireNumber) requireConsignmentNum(data.consignmentNum, 'create');
  if (!allowEmpty && Object.keys(data).length === 0) {
    throw new BadRequestError('At least one consignment field is required.');
  }
  return data;
}

async function assertConsignmentExists(client, consignmentNum) {
  const existing = await client.consignment.findUnique({ where: { consignmentNum } });
  if (!existing) throw new NotFoundError(`Consignment ${consignmentNum} was not found.`);
  return existing;
}

export async function createConsignment(payload, { prisma = null, ...connectionOptions } = {}) {
  const createRecord = async (client) => {
    const data = sanitizeConsignmentData(payload, { requireNumber: true });
    const consignmentNum = requireConsignmentNum(data.consignmentNum, 'create');
    data.consignmentNum = consignmentNum;
    const existing = await client.consignment.findUnique({ where: { consignmentNum } });
    if (existing) throw new ConflictError(`Consignment ${consignmentNum} already exists.`);
    return client.consignment.create({ data });
  };
  return prisma ? createRecord(prisma) : withDb(createRecord, connectionOptions);
}

export async function updateConsignment(consignmentNum, payload, { prisma = null, ...connectionOptions } = {}) {
  const updateRecord = async (client) => {
    const id = requireConsignmentNum(consignmentNum, 'update');
    await assertConsignmentExists(client, id);
    const data = sanitizeConsignmentData(payload);
    delete data.consignmentNum;
    if (Object.keys(data).length === 0) throw new BadRequestError('At least one editable consignment field is required.');
    return client.consignment.update({ where: { consignmentNum: id }, data });
  };
  return prisma ? updateRecord(prisma) : withDb(updateRecord, connectionOptions);
}

export async function deleteConsignment(consignmentNum, { prisma = null, ...connectionOptions } = {}) {
  const deleteRecord = async (client) => {
    const id = requireConsignmentNum(consignmentNum, 'delete');
    await assertConsignmentExists(client, id);
    return client.consignment.delete({ where: { consignmentNum: id } });
  };
  return prisma ? deleteRecord(prisma) : withDb(deleteRecord, connectionOptions);
}

export async function mutateConsignment({ action, consignmentNum = null, payload = {} } = {}, options = {}) {
  if (!CONSIGNMENT_MUTATION_OPERATIONS.has(action)) {
    throw new BadRequestError('Consignment action must be one of: create, update, delete.');
  }

  if (action === 'create') return createConsignment(payload, options);
  if (action === 'update') return updateConsignment(consignmentNum, payload, options);
  return deleteConsignment(consignmentNum, options);
}
