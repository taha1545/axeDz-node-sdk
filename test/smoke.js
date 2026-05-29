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

function testErrorExports() {
  assert.equal(typeof AxeDzError, 'function');
  assert.equal(typeof AuthenticationError, 'function');
}

async function run() {
  testConstructorValidation();
  await testSmsValidation();
  await testEmailValidation();
  testErrorExports();
  // eslint-disable-next-line no-console
  console.log('All smoke tests passed.');
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
