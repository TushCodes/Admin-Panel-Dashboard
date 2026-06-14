import { AppError } from './errorHandling.js';

export class APIResponse {
  static success(data = null, { message = 'OK', statusCode = 200, metadata = null } = {}) {
    const payload = { success: true, message, data };
    if (metadata) payload.metadata = { ...metadata };
    return [payload, statusCode];
  }

  static error(error) {
    if (!(error instanceof AppError)) throw new TypeError('errorResponse expects an AppError');
    return [{ success: false, error: error.toJSON() }, error.statusCode];
  }
}

export function jsonResponse(data = null, options = {}) {
  return APIResponse.success(data, options);
}

export function errorResponse(error) {
  return APIResponse.error(error);
}
