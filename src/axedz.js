'use strict';

const HttpClient = require('./core/httpClient');
const SMS = require('./modules/sms');
const Email = require('./modules/email');
const Wallet = require('./modules/wallet');
const { ValidationError } = require('./core/errors');

/**
 * AxeDz CPaaS SDK client.
 *
 * @example
 * const client = new AxeDz(process.env.AXEDZ_API_KEY, { debug: true });
 * const sms = await client.sms.send({ to: '+213555123456', message: 'Hello' });
 */
class AxeDz {
  /**
   * @param {string} apiKey - Your AxeDz API key.
   * @param {Object} [options]
   * @param {string} [options.baseURL] - API base URL (default: production).
   * @param {number} [options.timeout] - Request timeout in milliseconds.
   * @param {number} [options.retries] - Max retry attempts for retryable failures.
   * @param {boolean} [options.debug] - Enable sanitized debug logging.
   */
  constructor(apiKey, options = {}) {
    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      throw new ValidationError('API key is required');
    }

    this.options = {
      baseURL: options.baseURL,
      timeout: options.timeout,
      retries: options.retries,
      debug: options.debug,
    };

    this.http = new HttpClient(apiKey.trim(), this.options);

    /** @type {SMS} */
    this.sms = new SMS(this.http);
    /** @type {Email} */
    this.email = new Email(this.http);
    /** @type {Wallet} */
    this.wallet = new Wallet(this.http);
  }
}

module.exports = AxeDz;
