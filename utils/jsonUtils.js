import { BadRequestError } from './errorHandling.js';

export function parseJsonBody(rawBody) {
  if (rawBody == null) throw new BadRequestError('Request body cannot be empty.');

  if (rawBody && typeof rawBody === 'object' && !Buffer.isBuffer(rawBody) && !(rawBody instanceof Uint8Array)) {
    if (Array.isArray(rawBody)) throw new BadRequestError('Request body must be a JSON object.');
    return { ...rawBody };
  }

  const text = Buffer.isBuffer(rawBody) || rawBody instanceof Uint8Array
    ? Buffer.from(rawBody).toString('utf8')
    : rawBody;

  if (typeof text !== 'string' || !text.trim()) {
    throw new BadRequestError('Request body cannot be empty.');
  }

  try {
    const parsedBody = JSON.parse(text);
    if (!parsedBody || typeof parsedBody !== 'object' || Array.isArray(parsedBody)) {
      throw new BadRequestError('Request body must be a JSON object.');
    }
    return parsedBody;
  } catch (error) {
    if (error instanceof BadRequestError) throw error;
    throw new BadRequestError('Request body contains invalid JSON.', { details: { message: error.message } });
  }
}
