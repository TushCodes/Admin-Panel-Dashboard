import { BadRequestError } from './errorHandling.js';
import { normalizeForJson } from './dataNormalization.js';

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
