'use strict';

const { ValidationError } = require('../core/errors');
const { assertNonEmptyString, isNonEmptyString } = require('../core/utils');

function resolveRecipients(to) {
  if (Array.isArray(to)) {
    if (to.length === 0) {
      throw new ValidationError('Recipient number list cannot be empty');
    }

    return to.map((recipient, index) =>
      assertNonEmptyString(recipient, `Recipient phone number #${index + 1}`)
    );
  }

  return assertNonEmptyString(to, 'Phone number');
}

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
   * @param {string|string[]} params.to - Recipient phone number or list of numbers.
   * @param {string} params.message - SMS body (1–160 characters).
   * @param {string} [params.senderName] - Optional sender name.
   * @param {string} [params.provider] - Optional SMS provider override.
   * @param {AbortSignal} [params.signal] - Optional request cancellation signal.
   * @returns {Promise<{ success: true, data: Object, meta: Object }>}
   */
  async send({ to, message, senderName, provider, signal } = {}) {
    const toNumber = resolveRecipients(to);
    const body = assertNonEmptyString(message, 'Message');

    if (body.length > 160) {
      throw new ValidationError('Message must be between 1 and 160 characters');
    }

    const payload = {
      to_number: toNumber,
      message: body,
    };

    if (senderName) {
      payload.senderName = assertNonEmptyString(senderName, 'Sender name');
    }

    if (provider) {
      payload.provider = assertNonEmptyString(provider, 'Provider');
    }

    return this.http.post('/communication/send-sms', payload, { signal });
  }
}

module.exports = SMS;
