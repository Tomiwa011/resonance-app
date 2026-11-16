import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateOrder } from '../src/validators/order.validator.js';

const validBody = () => ({
  customer: {
    name: 'Ada Okafor',
    email: 'ada@example.com',
    phone: '08012345678',
    address: '12 Allen Avenue',
    city: 'Ikeja',
    state: 'Lagos',
    notes: '',
  },
  items: [{ productId: 4, quantity: 2 }],
});

// Runs validateOrder and returns the error it throws (or fails the test if none).
function failure(body) {
  try {
    validateOrder(body);
  } catch (error) {
    return error;
  }
  assert.fail('Expected validateOrder to throw');
}

test('accepts a valid order and trims the values', () => {
  const body = validBody();
  body.customer.name = '  Ada Okafor  ';
  body.customer.phone = '0801 234 5678';

  const result = validateOrder(body);

  assert.equal(result.customer.name, 'Ada Okafor');
  assert.equal(result.customer.phone, '08012345678');
  assert.deepEqual(result.items, [{ productId: 4, quantity: 2 }]);
});

test('accepts a +234 phone number', () => {
  const body = validBody();
  body.customer.phone = '+2348012345678';

  assert.equal(validateOrder(body).customer.phone, '+2348012345678');
});

test('notes are optional', () => {
  const body = validBody();
  delete body.customer.notes;

  assert.equal(validateOrder(body).customer.notes, '');
});

test('rejects a missing body', () => {
  assert.equal(failure(undefined).status, 400);
});

test('rejects an invalid email', () => {
  const body = validBody();
  body.customer.email = 'not-an-email';

  const error = failure(body);
  assert.equal(error.status, 400);
  assert.match(error.message, /email/i);
});

test('rejects an invalid phone number', () => {
  const body = validBody();
  body.customer.phone = '12345';

  const error = failure(body);
  assert.equal(error.status, 400);
  assert.match(error.message, /phone/i);
});

test('rejects a name that is too short', () => {
  const body = validBody();
  body.customer.name = 'A';

  assert.equal(failure(body).status, 400);
});

test('rejects an empty items list', () => {
  const body = validBody();
  body.items = [];

  assert.equal(failure(body).status, 400);
});

test('rejects a quantity of 0', () => {
  const body = validBody();
  body.items = [{ productId: 4, quantity: 0 }];

  assert.equal(failure(body).status, 400);
});

test('rejects a quantity above 100', () => {
  const body = validBody();
  body.items = [{ productId: 4, quantity: 101 }];

  assert.equal(failure(body).status, 400);
});

test('rejects a decimal quantity', () => {
  const body = validBody();
  body.items = [{ productId: 4, quantity: 1.5 }];

  assert.equal(failure(body).status, 400);
});

test('rejects a bad productId', () => {
  const body = validBody();
  body.items = [{ productId: 'abc', quantity: 1 }];

  assert.equal(failure(body).status, 400);
});