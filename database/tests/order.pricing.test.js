import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DELIVERY_FEE, mergeItems, priceOrder } from '../src/services/orders.service.js';

const catalogue = [
  { id: 1, name: 'XX99 Mark II Headphones', price: 1850000, stock: 12 },
  { id: 4, name: 'ZX9 Speaker', price: 4500000, stock: 5 },
  { id: 9, name: 'Sold Out Thing', price: 100000, stock: 0 },
];

// Runs priceOrder and returns the error it throws (or fails the test if none).
function failure(wanted) {
  try {
    priceOrder(wanted, catalogue);
  } catch (error) {
    return error;
  }
  assert.fail('Expected priceOrder to throw');
}

test('mergeItems adds up duplicate lines', () => {
  const wanted = mergeItems([
    { productId: 4, quantity: 1 },
    { productId: 4, quantity: 2 },
    { productId: 1, quantity: 1 },
  ]);

  assert.equal(wanted.get(4), 3);
  assert.equal(wanted.get(1), 1);
  assert.equal(wanted.size, 2);
});

test('priceOrder uses database prices and adds the delivery fee', () => {
  const result = priceOrder(
    new Map([
      [4, 1],
      [1, 2],
    ]),
    catalogue,
  );

  assert.equal(result.subtotal, 4500000 + 2 * 1850000);
  assert.equal(result.deliveryFee, DELIVERY_FEE);
  assert.equal(result.total, result.subtotal + DELIVERY_FEE);
  assert.equal(result.lines.length, 2);
});

test('priceOrder copies the name and unit price onto each line', () => {
  const { lines } = priceOrder(new Map([[4, 1]]), catalogue);

  assert.deepEqual(lines[0], {
    productId: 4,
    name: 'ZX9 Speaker',
    unitPrice: 4500000,
    quantity: 1,
  });
});

test('priceOrder allows buying exactly the remaining stock', () => {
  const result = priceOrder(new Map([[4, 5]]), catalogue);

  assert.equal(result.lines[0].quantity, 5);
});

test('priceOrder rejects more than the stock with a 409', () => {
  const error = failure(new Map([[4, 6]]));

  assert.equal(error.status, 409);
  assert.match(error.message, /Only 5 of ZX9 Speaker left/);
});

test('priceOrder rejects an out-of-stock product with a 409', () => {
  const error = failure(new Map([[9, 1]]));

  assert.equal(error.status, 409);
  assert.match(error.message, /out of stock/);
});

test('priceOrder rejects an unknown product with a 404', () => {
  const error = failure(new Map([[999, 1]]));

  assert.equal(error.status, 404);
});