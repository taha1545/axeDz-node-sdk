'use strict';

const { ValidationError } = require('../core/errors');
const { assertNonEmptyString } = require('../core/utils');

class SMS {
  /**
   * @param {import('../core/httpClient')} http
   */
  constructor(http) {
    this.http = http;
  }

  /**
   * Send an SMS message.
   *
   * @param {Object} params
   * @param {string} params.to - Recipient phone number (E.164 or local format accepted by API).
   * @param {string} params.message - SMS body (1–160 characters).
   * @param {string} [params.provider] - Optional SMS provider override.
   * @param {AbortSignal} [params.signal] - Optional request cancellation signal.
   * @returns {Promise<{ success: true, data: Object, meta: Object }>}
   */
  async send({ to, message, provider, signal } = {}) {
    const toNumber = assertNonEmptyString(to, 'Phone number');
    const body = assertNonEmptyString(message, 'Message');

    if (body.length > 160) {
      throw new ValidationError('Message must be between 1 and 160 characters');
    }

    const payload = {
      to_number: toNumber,
      message: body,
    };

    if (provider) {
      payload.provider = provider;
    }

    return this.http.post('/communication/send-sms', payload, { signal });
  }
}

module.exports = SMS;
