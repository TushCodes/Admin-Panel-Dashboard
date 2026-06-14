/**
 * Wrap an Express route or middleware handler and forward thrown/rejected errors
 * to Express' error middleware.
 *
 * @param {Function} handler Express request handler or middleware.
 * @returns {Function} Express-compatible handler.
 */
export function asyncHandler(handler) {
  if (typeof handler !== 'function') {
    throw new TypeError('asyncHandler expects a function');
  }

  return function wrappedAsyncHandler(req, res, next) {
    return Promise.resolve(handler(req, res, next)).catch((error) => {
      if (typeof next === 'function') return next(error);
      throw error;
    });
  };
}
