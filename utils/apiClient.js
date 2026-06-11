import { APIResponse } from '../model/api.js';
import { AppError } from './errorHandling.js';
import { fromJson, toJson } from './json.js';
import { getLogger } from './logging.js';

const apiLogger = getLogger('external_api');

export class ExternalAPIError extends AppError {
  static statusCode = 502;
  static code = 'external_api_error';
}

export function buildApiUrl(config, request) {
  const path = request.path.startsWith('/') ? request.path : `/${request.path}`;
  const url = new URL(`${config.normalizedBaseUrl}${path}`);
  if (request.query) {
    for (const [key, value] of Object.entries(request.query)) {
      const values = Array.isArray(value) ? value : [value];
      values.forEach((item) => url.searchParams.append(key, item));
    }
  }
  return url.toString();
}

export async function sendJsonRequest(config, request, { transport = fetch } = {}) {
  const url = buildApiUrl(config, request);
  const headers = config.headers(request.headers);
  const init = { method: request.method, headers };
  if (request.json != null) {
    init.body = toJson(request.json);
    headers['Content-Type'] ??= 'application/json';
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutSeconds * 1000);
  init.signal = controller.signal;

  try {
    const response = await transport(url, init);
    const apiResponse = await responseFromHttp(response);
    if (!apiResponse.ok) {
      throw new ExternalAPIError('External API returned an error response.', {
        statusCode: apiResponse.statusCode,
        details: { url, response: apiResponse.data },
      });
    }
    return apiResponse;
  } catch (error) {
    if (error instanceof ExternalAPIError) throw error;
    apiLogger.warning(`External API request failed: ${error.message}`);
    throw new ExternalAPIError('External API could not be reached.', { details: { url, reason: error.message } });
  } finally {
    clearTimeout(timeout);
  }
}

export async function responseFromHttp(response) {
  const text = typeof response.text === 'function' ? await response.text() : '';
  const data = text ? fromJson(text) : null;
  const headers = response.headers && typeof response.headers.entries === 'function'
    ? Object.fromEntries(response.headers.entries())
    : { ...(response.headers ?? {}) };
  return new APIResponse({ statusCode: response.status ?? response.statusCode ?? 200, data, headers });
}
