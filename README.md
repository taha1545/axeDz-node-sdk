# AxeDz Node.js SDK

Official Node.js SDK for AxeDz CPaaS platform.

Provides simple access to:
- SMS sending
- Email sending
- Wallet balance & transactions

---

## Installation

```bash
npm install axedz
```

## Usage

```js
const AxeDz = require('axedz');
const client = new AxeDz(process.env.AXEDZ_API_KEY);
```

### Send email

The `to` field accepts a single email or an array of emails. You can send HTML or text content, and include `senderName`, `callback_url`, and `callbackData`.

```js
await client.email.send({
  to: ['user1@example.com', 'user2@example.com'],
  subject: 'Welcome',
  body: '<h1>Hello World</h1>',
  body_type: 'html',
  senderName: 'AxeDz',
  callback_url: 'https://webhook.site/129b1309-5626-4a61-ac52-60f73fe4aa6b',
  callbackData: { user_id: 123 },
});
```

### Send SMS

The `to` field accepts a single phone number or an array of phone numbers. You can also pass `senderName` or `provider`.

```js
await client.sms.send({
  to: ['+12345678901', '+19876543210'],
  message: 'Hello',
  senderName: 'MyProvider',
});
```
