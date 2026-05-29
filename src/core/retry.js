'use strict';

const { isRetryableError } = require('./utils');

const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_BASE_DELAY_MS = 300;
const DEFAULT_MAX_DELAY_MS = 5000;

/**
 * @param {number} attempt
 * @param {number} baseDelayMs
 * @param {number} maxDelayMs
 * @returns {number}
 */
function getBackoffDelay(attempt, baseDelayMs, maxDelayMs) {
  const exponential = baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.floor(Math.random() * 100);
  return Math.min(exponential + jitter, maxDelayMs);
}

/**
 * @param {() => Promise<*>} operation
 * @param {Object} [options]
 * @param {number} [options.maxRetries]
 * @param {number} [options.baseDelayMs]
 * @param {number} [options.maxDelayMs]
 * @param {boolean} [options.debug]
 * @param {(message: string, meta?: Object) => void} [options.logger]
 * @returns {Promise<*>}
 */
async function executeWithRetry(operation, options = {}) {
  const maxRetries = Number.isInteger(options.maxRetries)
    ? options.maxRetries
    : DEFAULT_MAX_RETRIES;
  const baseDelayMs = options.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
  const maxDelayMs = options.maxDelayMs ?? DEFAULT_MAX_DELAY_MS;
  const debug = Boolean(options.debug);
  const logger = options.logger || (() => {});

  let attempt = 0;

  while (true) {
    try {
      return await operation();
    } catch (error) {
      const canRetry = isRetryableError(error) && attempt < maxRetries;

      if (!canRetry) {
        throw error;
      }

      const delay = getBackoffDelay(attempt, baseDelayMs, maxDelayMs);
      attempt += 1;

      if (debug) {
        logger(`Retrying request (${attempt}/${maxRetries}) after ${delay}ms`, {
          error: error.message,
          statusCode: error.statusCode ?? null,
        });
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

module.exports = {
  DEFAULT_MAX_RETRIES,
  executeWithRetry,
  getBackoffDelay,
};
