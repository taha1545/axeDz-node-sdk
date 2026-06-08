'use strict';

const { ValidationError } = require('../core/errors');
const { assertNonEmptyString, isNonEmptyString, isValidEmail } = require('../core/utils');

function validateEmailAddress(value, fieldName) {
  const email = assertNonEmptyString(value, fieldName);

  if (!isValidEmail(email)) {
    throw new ValidationError(`Invalid email format for ${fieldName}`);
  }

  return email;
}

function resolveRecipients(to) {
  if (Array.isArray(to)) {
    if (to.length === 0) {
      throw new ValidationError('Recipient email list cannot be empty');
    }

    return to.map((recipient, index) =>
      validateEmailAddress(recipient, `Recipient email #${index + 1}`)
    );
  }

  return validateEmailAddress(to, 'Recipient email');
}

function resolveContent({ body, html, text, message, body_type }) {
  const content = body ?? html ?? text ?? message;

  if (!isNonEmptyString(content)) {
    throw new ValidationError('Email body is required (body, html, text, or message)');
  }

  const resolvedBodyType =
    body_type ||
    (html ? 'html' : text ? 'text' : undefined);

  if (!resolvedBodyType) {
    throw new ValidationError('body_type is required when using body content');
  }

  if (!['text', 'html'].includes(resolvedBodyType)) {
    throw new ValidationError('body_type must be "text" or "html"');
  }

  return {
    body: content.trim(),
    body_type: resolvedBodyType,
  };
}

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
   * @param {string|string[]} params.to - Recipient email address or list of addresses.
   * @param {string} params.subject - Email subject line.
   * @param {string} [params.body] - Message body.
   * @param {string} [params.html] - HTML body (sets body_type to html).
   * @param {string} [params.text] - Plain-text body (sets body_type to text).
   * @param {string} [params.message] - Alias for text/html content.
   * @param {'text'|'html'} [params.body_type] - Explicit body type.
   * @param {string} [params.senderName] - Optional sender name.
   * @param {string} [params.callback_url] - Optional callback URL.
   * @param {Object} [params.callbackData] - Optional callback payload.
   * @param {AbortSignal} [params.signal] - Optional request cancellation signal.
   * @returns {Promise<{ success: true, data: Object, meta: Object }>}
   */
  async send({ to, subject, body, html, text, message, body_type, senderName, callback_url, callbackData, callback_data, signal } = {}) {
    const toEmail = resolveRecipients(to);
    const emailSubject = assertNonEmptyString(subject, 'Subject');
    const content = resolveContent({ body, html, text, message, body_type });

    if (emailSubject.length > 150) {
      throw new ValidationError('Subject must be 1–150 characters');
    }

    if (content.body.length > 5000) {
      throw new ValidationError('Message must be 1–5000 characters');
    }

    const payload = {
      to_email: toEmail,
      subject: emailSubject.trim(),
      body: content.body,
      body_type: content.body_type,
    };

    if (senderName) {
      payload.senderName = assertNonEmptyString(senderName, 'Sender name');
    }

    if (callback_url) {
      payload.callback_url = assertNonEmptyString(callback_url, 'Callback URL');
    }

    const cbData = callbackData ?? callback_data;
    if (cbData !== undefined) {
      if (typeof cbData !== 'object' || cbData === null || Array.isArray(cbData)) {
        throw new ValidationError('callback_data must be an object');
      }
      payload.callbackData = cbData;
    }

    return this.http.post('/communication/send-email', payload, { signal });
  }
}

module.exports = Email;
