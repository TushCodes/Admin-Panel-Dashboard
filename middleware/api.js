import { handleException } from '../utils/errorHandling.js';
import { jsonResponse } from '../utils/json.js';

export class ApiMw {
  constructor(app, { debug = false } = {}) { this.app = app; this.debug = debug; }
  handle(req) { try { return this.wrap(this.app(req)); } catch (exc) { return handleException(exc, { includeDebug: this.debug }); } }
  wrap(res) {
    if (Array.isArray(res) && res.length === 2) {
      const [data, code] = res;
      if (data && typeof data === 'object' && 'success' in data) return [{ ...data }, Number(code)];
      return jsonResponse(data, { statusCode: Number(code) });
    }
    if (res && typeof res === 'object' && 'success' in res) return [{ ...res }, 200];
    return jsonResponse(res);
  }
}
