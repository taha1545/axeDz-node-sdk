'use strict';

const {
  AxeDzError,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  NetworkError,
  ServerError,
} = require('./errors');

const SENSITIVE_HEADERS = ['x-api-key', 'authorization', 'cookie'];

/**
 * @param {string} value
 * @returns {boolean}
 */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * @param {string} value
 * @returns {string}
 */
function assertNonEmptyString(value, fieldName) {
  if (!isNonEmptyString(value)) {
    throw new ValidationError(`${fieldName} is required`);
  }
  return value.trim();
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * @param {Object} headers
 * @returns {Object}
 */
function sanitizeHeaders(headers = {}) {
  const sanitized = { ...headers };

  for (const key of Object.keys(sanitized)) {
    if (SENSITIVE_HEADERS.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * @param {import('axios').AxiosError} error
 * @returns {Object}
 */
function buildRequestContext(error) {
  const config = error.config || {};

  return {
    method: (config.method || 'GET').toUpperCase(),
    url: config.url || null,
    baseURL: config.baseURL || null,
    headers: sanitizeHeaders(config.headers),
  };
}

/**
 * @param {import('axios').AxiosError} error
 * @returns {AxeDzError}
 */
function normalizeAxiosError(error) {
  const request = buildRequestContext(error);
  const response = error.response;
  const statusCode = response?.status ?? null;
  const rawResponse = response?.data ?? null;
  const message =
    rawResponse?.message ||
    error.message ||
    'Request failed';

  const context = {
    statusCode,
    rawResponse,
    request,
  };

  if (!response) {
    const isTimeout =
      error.code === 'ECONNABORTED' ||
      error.message?.toLowerCase().includes('timeout');

    return new NetworkError(
      isTimeout ? 'Request timed out' : 'Unable to reach AxeDz API',
      {
        ...context,
        code: error.code || null,
      }
    );
  }

  if (statusCode === 401 || statusCode === 403) {
    return new AuthenticationError(message, context);
  }

  if (statusCode === 400 || statusCode === 422) {
    return new ValidationError(message, {
      ...context,
      errors: rawResponse?.errors ?? null,
    });
  }

  if (statusCode === 429) {
    const retryAfter = response.headers?.['retry-after'] ?? null;
    return new RateLimitError(message, {
      ...context,
      retryAfter,
    });
  }

  if (statusCode >= 500) {
    return new ServerError(message, context);
  }

  return new AxeDzError(message, context);
}

/**
 * @param {*} payload
 * @param {Object} [meta]
 * @returns {{ success: true, data: *, meta: Object }}
 */
function formatSuccessResponse(payload, meta = {}) {
  const hasEnvelope =
    payload &&
    typeof payload === 'object' &&
    Object.prototype.hasOwnProperty.call(payload, 'success');

  const data = hasEnvelope && payload.data !== undefined ? payload.data : payload;
  const responseMeta = {
    ...meta,
  };

  if (hasEnvelope && payload.message) {
    responseMeta.message = payload.message;
  }

  if (hasEnvelope && payload.pagination) {
    responseMeta.pagination = payload.pagination;
  }

  return {
    success: true,
    data,
    meta: responseMeta,
  };
}

/**
 * @param {AxeDzError} error
 * @returns {boolean}
 */
function isRetryableError(error) {
  if (error instanceof NetworkError || error instanceof ServerError) {
    return true;
  }

  return false;
}

module.exports = {
  assertNonEmptyString,
  formatSuccessResponse,
  isNonEmptyString,
  isRetryableError,
  isValidEmail,
  normalizeAxiosError,
  sanitizeHeaders,
};
