'use strict';

const { ValidationError } = require('../core/errors');
const { assertNonEmptyString, isValidEmail } = require('../core/utils');

class Email {
  /**
   * @param {import('../core/httpClient')} http
   */
  constructor(http) {
    this.http = http;
  }

  /**
   * Send an email message.
   *
   * @param {Object} params
   * @param {string} params.to - Recipient email address.
   * @param {string} params.subject - Email subject line.
   * @param {string} [params.html] - HTML body (sets body_type to html).
   * @param {string} [params.text] - Plain-text body (sets body_type to text).
   * @param {string} [params.message] - Alias for text/html content.
   * @param {'text'|'html'} [params.body_type] - Explicit body type when using `message`.
   * @param {AbortSignal} [params.signal] - Optional request cancellation signal.
   * @returns {Promise<{ success: true, data: Object, meta: Object }>}
   */
  async send({ to, subject, html, text, message, body_type, signal } = {}) {
    const toEmail = assertNonEmptyString(to, 'Recipient email');
    const emailSubject = assertNonEmptyString(subject, 'Subject');

    if (!isValidEmail(toEmail)) {
      throw new ValidationError('Invalid email format');
    }

    const content = html || text || message;

    if (!content || typeof content !== 'string' || !content.trim()) {
      throw new ValidationError('Email body is required (html, text, or message)');
    }

    const resolvedBodyType = body_type || (html ? 'html' : 'text');

    if (!['text', 'html'].includes(resolvedBodyType)) {
      throw new ValidationError('body_type must be "text" or "html"');
    }

    if (emailSubject.length > 150) {
      throw new ValidationError('Subject must be 1–150 characters');
    }

    if (content.trim().length > 5000) {
      throw new ValidationError('Message must be 1–5000 characters');
    }

    return this.http.post(
      '/communication/send-email',
      {
        to_email: toEmail,
        subject: emailSubject.trim(),
        message: content.trim(),
        body_type: resolvedBodyType,
      },
      { signal }
    );
  }
}

module.exports = Email;
