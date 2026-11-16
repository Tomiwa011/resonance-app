import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';

// Fake values BEFORE the app loads, so these tests can never touch the real database.
// Port 1 has nothing listening, so any database query fails immediately.
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';

const { default: app } = await import('../src/app.js');

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://localhost:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

const postOrder = (body) =>
  fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

test('GET /api/health reports 503 when the database is unreachable', async () => {
  const response = await fetch(`${baseUrl}/api/health`);

  assert.equal(response.status, 503);
});

test('an unknown API route returns a JSON 404', async () => {
  const response = await fetch(`${baseUrl}/api/banana`);

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'Not found' });
});

test('an unknown category is rejected with a 400', async () => {
  const response = await fetch(`${baseUrl}/api/products?category=banana`);

  assert.equal(response.status, 400);
});

test('a bad ids list is rejected with a 400', async () => {
  const response = await fetch(`${baseUrl}/api/products?ids=1,abc`);

  assert.equal(response.status, 400);
});

test('POST /api/orders with an empty object is rejected with a 400', async () => {
  const response = await postOrder('{}');

  assert.equal(response.status, 400);
  assert.ok((await response.json()).error);
});

test('POST /api/orders with broken JSON is rejected with a 400', async () => {
  const response = await postOrder('{oops');

  assert.equal(response.status, 400);
});

test('POST /api/orders with a bad phone number says so', async () => {
  const response = await postOrder(
    JSON.stringify({
      customer: {
        name: 'Ada Okafor',
        email: 'ada@example.com',
        phone: '123',
        address: '12 Allen Avenue',
        city: 'Ikeja',
        state: 'Lagos',
      },
      items: [{ productId: 4, quantity: 1 }],
    }),
  );

  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /phone/i);
});