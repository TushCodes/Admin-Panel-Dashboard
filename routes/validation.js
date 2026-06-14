import { ValidationError } from '../utils/errorHandling.js';

export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
      return next(new ValidationError('Request validation failed.', {
        details: { issues: result.error.issues.map(({ path, message, code }) => ({ path: path.join('.'), message, code })) },
      }));
    }
    req[source] = result.data;
    return next();
  };
}
