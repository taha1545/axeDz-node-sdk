'use strict';

const assert = require('node:assert/strict');
const AxeDz = require('../index');
const {
  ValidationError,
  AuthenticationError,
  AxeDzError,
} = require('../index');

function testConstructorValidation() {
  assert.throws(() => new AxeDz(''), ValidationError);
  assert.throws(() => new AxeDz('   '), ValidationError);
}

async function testSmsValidation() {
  const client = new AxeDz('test-api-key');
  await assert.rejects(() => client.sms.send({ message: 'hi' }), ValidationError);
  await assert.rejects(() => client.sms.send({ to: '+213555000000' }), ValidationError);
}

async function testEmailValidation() {
  const client = new AxeDz('test-api-key');
  await assert.rejects(
    () => client.email.send({ to: 'bad', subject: 'Hi', html: '<p>x</p>' }),
    ValidationError
  );
  await assert.rejects(
    () => client.email.send({ to: 'a@b.com', subject: 'Hi' }),
    ValidationError
  );
}

async function testSmsArrayAndSender() {
  const client = new AxeDz('test-api-key');
  client.http.post = async (path, payload) => {
    assert.equal(path, '/communication/send-sms');
    assert.deepEqual(payload, {
      to_number: ['+12345678901', '+19876543210'],
      message: 'Hello',
      senderName: 'MyProvider',
    });
    return { success: true, data: {}, meta: {} };
  };

  const result = await client.sms.send({
    to: ['+12345678901', '+19876543210'],
    message: 'Hello',
    senderName: 'MyProvider',
  });

  assert.equal(result.success, true);
}

async function testEmailArrayAndCallback() {
  const client = new AxeDz('test-api-key');
  client.http.post = async (path, payload) => {
    assert.equal(path, '/communication/send-email');
    assert.deepEqual(payload, {
      to_email: ['a@b.com', 'c@d.com'],
      subject: 'Welcome',
      body: '<h1>Hello World</h1>',
      body_type: 'html',
      senderName: 'AxeDz',
      callback_url: 'https://webhook.site/129b1309-5626-4a61-ac52-60f73fe4aa6b',
      callbackData: { user_id: 123 },
    });
    return { success: true, data: {}, meta: {} };
  };

  const result = await client.email.send({
    to: ['a@b.com', 'c@d.com'],
    subject: 'Welcome',
    body: '<h1>Hello World</h1>',
    body_type: 'html',
    senderName: 'AxeDz',
    callback_url: 'https://webhook.site/129b1309-5626-4a61-ac52-60f73fe4aa6b',
    callbackData: { user_id: 123 },
  });

  assert.equal(result.success, true);
}

function testErrorExports() {
  assert.equal(typeof AxeDzError, 'function');
  assert.equal(typeof AuthenticationError, 'function');
}

async function run() {
  testConstructorValidation();
  await testSmsValidation();
  await testEmailValidation();
  await testSmsArrayAndSender();
  await testEmailArrayAndCallback();
  testErrorExports();
  // eslint-disable-next-line no-console
  console.log('All smoke tests passed.');
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
