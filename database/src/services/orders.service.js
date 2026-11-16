import { randomBytes } from 'node:crypto';
import { pool } from '../config/db.js';
import { AppError } from '../utils/AppError.js';

// Keep this in sync with the delivery fee your checkout page shows.
export const DELIVERY_FEE = 5000;

function makeOrderNumber() {
  return `RS-${randomBytes(4).toString('hex').toUpperCase()}`;
}

// Merges duplicate lines, so the same product can't be listed twice.
// [{ productId: 4, quantity: 1 }, { productId: 4, quantity: 2 }] -> Map { 4 => 3 }
export function mergeItems(items) {
  const wanted = new Map();
  for (const item of items) {
    wanted.set(item.productId, (wanted.get(item.productId) ?? 0) + item.quantity);
  }
  return wanted;
}

// Works out prices and checks stock. No database access, so it's easy to test.
// `wanted` is a Map of productId -> quantity.
// `products` is a list of { id, name, price, stock } rows from the database.
export function priceOrder(wanted, products) {
  const byId = new Map(products.map((product) => [product.id, product]));
  const lines = [];

  for (const [productId, quantity] of wanted) {
    const product = byId.get(productId);

    if (!product) {
      throw new AppError(404, `Product ${productId} no longer exists`);
    }
    if (product.stock < quantity) {
      throw new AppError(
        409,
        product.stock === 0
          ? `${product.name} is out of stock`
          : `Only ${product.stock} of ${product.name} left`,
      );
    }

    lines.push({
      productId,
      name: product.name,
      unitPrice: product.price,
      quantity,
    });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

  return {
    lines,
    subtotal,
    deliveryFee: DELIVERY_FEE,
    total: subtotal + DELIVERY_FEE,
  };
}

// customer: { name, email, phone, address, city, state, notes }
// items: [{ productId, quantity }]   (already validated)
export async function createOrder({ customer, items }) {
  const wanted = mergeItems(items);
  const productIds = [...wanted.keys()];

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // FOR UPDATE locks these product rows until we commit, so two people
    // buying the last item at the same moment can't both succeed.
    const { rows: products } = await client.query(
      'SELECT id, name, price, stock FROM products WHERE id = ANY($1::int[]) FOR UPDATE',
      [productIds],
    );

    const { lines, subtotal, deliveryFee, total } = priceOrder(wanted, products);
    const orderNumber = makeOrderNumber();

    const orderResult = await client.query(
      `INSERT INTO orders
         (order_number, customer_name, email, phone, address, city, state,
          notes, subtotal, delivery_fee, total)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, created_at`,
      [
        orderNumber,
        customer.name,
        customer.email,
        customer.phone,
        customer.address,
        customer.city,
        customer.state,
        customer.notes || null,
        subtotal,
        deliveryFee,
        total,
      ],
    );

    const order = orderResult.rows[0];

    for (const line of lines) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, line.productId, line.name, line.unitPrice, line.quantity],
      );

      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [
        line.quantity,
        line.productId,
      ]);
    }

    await client.query('COMMIT');

    return {
      orderNumber,
      status: 'pending',
      subtotal,
      deliveryFee,
      total,
      createdAt: order.created_at,
      items: lines.map((line) => ({
        productId: line.productId,
        name: line.name,
        unitPrice: line.unitPrice,
        quantity: line.quantity,
      })),
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}