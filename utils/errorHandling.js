import { getLogger } from './logging.js';

const errorLogger = getLogger('errors');

export class AppError extends Error {
  static statusCode = 500;
  static code = 'internal_server_error';

  constructor(message = 'An unexpected error occurred.', { statusCode = null, code = null, details = null } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.statusCode = statusCode ?? this.constructor.statusCode;
    this.code = code ?? this.constructor.code;
    this.details = details ? { ...details } : {};
  }

  toJSON() {
    const payload = { code: this.code, message: this.message };
    if (Object.keys(this.details).length > 0) payload.details = this.details;
    return payload;
  }

  toDict() {
    return this.toJSON();
  }
}

export class BadRequestError extends AppError { static statusCode = 400; static code = 'bad_request'; }
export class UnauthorizedError extends AppError { static statusCode = 401; static code = 'unauthorized'; }
export class ForbiddenError extends AppError { static statusCode = 403; static code = 'forbidden'; }
export class NotFoundError extends AppError { static statusCode = 404; static code = 'not_found'; }
export class ConflictError extends AppError { static statusCode = 409; static code = 'conflict'; }
export class ValidationError extends AppError { static statusCode = 422; static code = 'validation_error'; }
export class InternalServerError extends AppError { static statusCode = 500; static code = 'internal_server_error'; }

export function handleException(exc, { includeDebug = false } = {}) {
  if (exc instanceof AppError) {
    const payload = { success: false, error: exc.toJSON() };
    if (exc.statusCode >= 500) errorLogger.error(`Application error: ${exc.message}`);
    else errorLogger.warning(`Request error: ${exc.message}`);
    return [payload, exc.statusCode];
  }

  errorLogger.error(`Unhandled exception: ${exc?.message ?? exc}`);
  const error = new InternalServerError();
  const payload = { success: false, error: error.toJSON() };
  if (includeDebug) {
    payload.error.details = {
      exception: exc?.constructor?.name ?? 'Error',
      message: exc?.message ?? String(exc),
    };
  }
  return [payload, error.statusCode];
}
