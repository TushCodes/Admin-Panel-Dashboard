export class APIConfig {
  constructor({ baseUrl, defaultHeaders = {}, timeoutSeconds = 10.0, apiKey = null, apiKeyHeader = 'Authorization', apiKeyPrefix = 'Bearer' } = {}) {
    if (!baseUrl || !String(baseUrl).trim()) throw new Error('base_url is required for external API integrations');
    if (timeoutSeconds <= 0) throw new Error('timeout_seconds must be greater than zero');
    this.baseUrl = baseUrl;
    this.defaultHeaders = { ...defaultHeaders };
    this.timeoutSeconds = timeoutSeconds;
    this.apiKey = apiKey;
    this.apiKeyHeader = apiKeyHeader;
    this.apiKeyPrefix = apiKeyPrefix;
  }

  get normalizedBaseUrl() {
    return this.baseUrl.replace(/\/+$/, '');
  }

  headers(extraHeaders = null) {
    const headers = { Accept: 'application/json', ...this.defaultHeaders };
    if (this.apiKey) headers[this.apiKeyHeader] = this.apiKeyPrefix ? `${this.apiKeyPrefix} ${this.apiKey}` : this.apiKey;
    if (extraHeaders) Object.assign(headers, extraHeaders);
    return headers;
  }
}

export class APIRequest {
  constructor({ method, path, query = null, headers = null, json = null } = {}) {
    if (!method || !String(method).trim()) throw new Error('method is required');
    if (!path || !String(path).trim()) throw new Error('path is required');
    this.method = String(method).toUpperCase();
    this.path = path;
    this.query = query;
    this.headers = headers;
    this.json = json;
  }
}

export class APIResponse {
  constructor({ statusCode, data = null, headers = {} } = {}) {
    this.statusCode = statusCode;
    this.data = data;
    this.headers = { ...headers };
  }

  get ok() {
    return this.statusCode >= 200 && this.statusCode < 300;
  }
}
