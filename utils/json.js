import { AppError, BadRequestError } from './errorHandling.js';

function normalizeForJson(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'bigint') return value.toString();
  if (Array.isArray(value)) return value.map(normalizeForJson);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, normalizeForJson(val)]));
  }
  return value;
}

export function toJson(payload) {
  return JSON.stringify(normalizeForJson(payload));
}

export function fromJson(rawBody) {
  let text = rawBody;
  if (rawBody instanceof Uint8Array || Buffer.isBuffer(rawBody)) {
    text = Buffer.from(rawBody).toString('utf8');
  }
  if (typeof text !== 'string' || !text.trim()) {
    throw new BadRequestError('Request body cannot be empty.');
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new BadRequestError('Request body contains invalid JSON.', { details: { message: error.message } });
  }
}

export function parseJsonBody(rawBody, { requireObject = true } = {}) {
  if (rawBody == null) throw new BadRequestError('Request body cannot be empty.');
  const parsedBody = rawBody && typeof rawBody === 'object' && !Buffer.isBuffer(rawBody) && !(rawBody instanceof Uint8Array)
    ? { ...rawBody }
    : fromJson(rawBody);
  if (requireObject && (!parsedBody || typeof parsedBody !== 'object' || Array.isArray(parsedBody))) {
    throw new BadRequestError('Request body must be a JSON object.');
  }
  return parsedBody;
}

export function jsonResponse(data = null, { message = 'OK', statusCode = 200, metadata = null } = {}) {
  const payload = { success: true, message, data };
  if (metadata) payload.metadata = { ...metadata };
  return [payload, statusCode];
}

export function errorResponse(error) {
  if (!(error instanceof AppError)) throw new TypeError('errorResponse expects an AppError');
  return [{ success: false, error: error.toJSON() }, error.statusCode];
}
