import { AppError } from './errorHandling.js';

export function jsonResponse(data = null, { message = 'OK', statusCode = 200, metadata = null } = {}) {
  const payload = { success: true, message, data };
  if (metadata) payload.metadata = { ...metadata };
  return [payload, statusCode];
}

export function errorResponse(error) {
  if (!(error instanceof AppError)) throw new TypeError('errorResponse expects an AppError');
  return [{ success: false, error: error.toJSON() }, error.statusCode];
}
