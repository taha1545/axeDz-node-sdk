'use strict';

/**
 * Wallet operations for API-key authenticated accounts.
 */
class Wallet {
  /**
   * @param {import('../core/httpClient')} http
   */
  constructor(http) {
    this.http = http;
  }

  /**
   * Fetch the current wallet balance for the authenticated API key.
   *
   * @param {Object} [options]
   * @param {AbortSignal} [options.signal] - Optional request cancellation signal.
   * @returns {Promise<{ success: true, data: Object, meta: Object }>}
   */
  async getBalance(options = {}) {
    return this.http.get('/communication/wallet', {
      signal: options.signal,
    });
  }

  /**
   * Alias for {@link Wallet#getBalance}.
   *
   * @param {Object} [options]
   * @returns {Promise<{ success: true, data: Object, meta: Object }>}
   */
  balance(options = {}) {
    return this.getBalance(options);
  }

  /**
   * List wallet usage / billing transactions for the authenticated API key.
   *
   * @param {Object} [options]
   * @param {number} [options.limit=20] - Page size.
   * @param {number} [options.offset=0] - Pagination offset.
   * @param {AbortSignal} [options.signal] - Optional request cancellation signal.
   * @returns {Promise<{ success: true, data: Object, meta: Object }>}
   */
  async getTransactions({ limit = 20, offset = 0, signal } = {}) {
    return this.http.get('/communication/usage', {
      params: { limit, offset },
      signal,
    });
  }
}

module.exports = Wallet;
