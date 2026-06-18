import { AppError } from './errorHandling.js';

export class APIResponse {
  static success(data = null, options = {}) {
    return jsonResponse(data, options);
  }

  static error(error) {
    return errorResponse(error);
  }

  static envelope(data = null, { message = 'OK', metadata = null } = {}) {
    const payload = { success: true, message, data };
    if (metadata) payload.metadata = { ...metadata };
    return payload;
  }
}

export function jsonResponse(data = null, { message = 'OK', statusCode = 200, metadata = null } = {}) {
  return [APIResponse.envelope(data, { message, metadata }), statusCode];
}

export function errorResponse(error) {
  if (!(error instanceof AppError)) throw new TypeError('errorResponse expects an AppError');
  return [{ success: false, error: error.toJSON() }, error.statusCode];
}
