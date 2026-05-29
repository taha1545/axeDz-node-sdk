'use strict';

const axios = require('axios');
const { executeWithRetry } = require('./retry');
const {
  formatSuccessResponse,
  normalizeAxiosError,
  sanitizeHeaders,
} = require('./utils');

const DEFAULT_BASE_URL = 'https://axedz-backend.onrender.com/api';
const DEFAULT_TIMEOUT_MS = 30000;
const API_KEY_HEADER = 'x-api-key';

class HttpClient {
  /**
   * @param {string} apiKey
   * @param {Object} [options]
   * @param {string} [options.baseURL]
   * @param {number} [options.timeout]
   * @param {number} [options.retries]
   * @param {boolean} [options.debug]
   */
  constructor(apiKey, options = {}) {
    //
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('API key is required');
    }

    this.apiKey = apiKey;
    this.debug = Boolean(options.debug);
    this.retries = Number.isInteger(options.retries) ? options.retries : 2;

    this.client = axios.create({
      baseURL: options.baseURL || DEFAULT_BASE_URL,
      timeout: options.timeout ?? DEFAULT_TIMEOUT_MS,
      headers: {
        [API_KEY_HEADER]: apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      validateStatus: (status) => status >= 200 && status < 300,
    });

    this._setupInterceptors();
  }

  _setupInterceptors() {
    this.client.interceptors.request.use((config) => {
      if (this.debug) {
        this._log('Request', {
          method: (config.method || 'GET').toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          headers: sanitizeHeaders(config.headers),
          params: config.params || null,
        });
      }

      return config;
    });

    this.client.interceptors.response.use(
      (response) => {
        if (this.debug) {
          this._log('Response', {
            status: response.status,
            url: response.config?.url,
          });
        }

        return response;
      },
      (error) => Promise.reject(normalizeAxiosError(error))
    );
  }

  /**
   * @param {string} message
   * @param {Object} [meta]
   * @private
   */
  _log(message, meta = {}) {
    if (!this.debug) {
      return;
    }

    // eslint-disable-next-line no-console
    console.debug(`[AxeDz SDK] ${message}`, meta);
  }

  /**
   * @param {import('axios').AxiosRequestConfig} config
   * @returns {Promise<{ success: true, data: *, meta: Object }>}
   */
  async request(config) {
    const operation = async () => {
      const response = await this.client.request(config);
      return formatSuccessResponse(response.data, {
        statusCode: response.status,
        headers: response.headers,
      });
    };

    return executeWithRetry(operation, {
      maxRetries: this.retries,
      debug: this.debug,
      logger: (message, meta) => this._log(message, meta),
    });
  }

  /**
   * @param {string} url
   * @param {Object} [data]
   * @param {Object} [options]
   * @param {import('axios').AxiosRequestConfig} [options.config]
   * @returns {Promise<{ success: true, data: *, meta: Object }>}
   */
  post(url, data = {}, options = {}) {
    return this.request({
      method: 'POST',
      url,
      data,
      ...options.config,
      signal: options.signal,
    });
  }

  /**
   * @param {string} url
   * @param {Object} [options]
   * @param {Object} [options.params]
   * @param {import('axios').AxiosRequestConfig} [options.config]
   * @param {AbortSignal} [options.signal]
   * @returns {Promise<{ success: true, data: *, meta: Object }>}
   */
  get(url, options = {}) {
    return this.request({
      method: 'GET',
      url,
      params: options.params,
      ...options.config,
      signal: options.signal,
    });
  }
}

module.exports = HttpClient;
