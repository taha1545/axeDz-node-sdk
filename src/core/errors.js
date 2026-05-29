'use strict';

/**
 * @typedef {Object} ErrorContext
 * @property {number} [statusCode]
 * @property {*} [rawResponse]
 * @property {Object} [request]
 */

/**
 * Base error for all AxeDz SDK failures.
 */
class AxeDzError extends Error {
  /**
   * @param {string} message
   * @param {ErrorContext} [context]
   */
  constructor(message = 'An unexpected error occurred', context = {}) {
    super(message);
    this.name = 'AxeDzError';
    this.statusCode = context.statusCode ?? null;
    this.rawResponse = context.rawResponse ?? null;
    this.request = context.request ?? null;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class AuthenticationError extends AxeDzError {
  constructor(message = 'Authentication failed', context = {}) {
    super(message, context);
    this.name = 'AuthenticationError';
  }
}

class ValidationError extends AxeDzError {
  constructor(message = 'Validation failed', context = {}) {
    super(message, context);
    this.name = 'ValidationError';
    this.errors = context.errors ?? null;
  }
}

class RateLimitError extends AxeDzError {
  constructor(message = 'Rate limit exceeded', context = {}) {
    super(message, context);
    this.name = 'RateLimitError';
    this.retryAfter = context.retryAfter ?? null;
  }
}

class NetworkError extends AxeDzError {
  constructor(message = 'Network request failed', context = {}) {
    super(message, context);
    this.name = 'NetworkError';
    this.code = context.code ?? null;
  }
}

class ServerError extends AxeDzError {
  constructor(message = 'Server error', context = {}) {
    super(message, context);
    this.name = 'ServerError';
  }
}

module.exports = {
  AxeDzError,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  NetworkError,
  ServerError,
};
