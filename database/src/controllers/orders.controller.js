import { createOrder as createOrderRecord } from '../services/orders.service.js';
import { AppError } from '../utils/AppError.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^(0\d{10}|\+234\d{10})$/;

function text(value, field, { min = 1, max = 200, required = true } = {}) {
  const cleaned = typeof value === 'string' ? value.trim() : '';

  if (!cleaned && !required) return '';
  if (cleaned.length < min || cleaned.length > max) {
    throw new AppError(400, `${field} must be between ${min} and ${max} characters`);
  }
  return cleaned;
}

function validateOrder(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError(400, 'Request body must be JSON');
  }

  const raw = body.customer ?? {};

  const customer = {
    name: text(raw.name, 'Name', { min: 2, max: 100 }),
    email: text(raw.email, 'Email', { max: 254 }),
    phone: text(raw.phone, 'Phone', { max: 20 }).replace(/[\s-]/g, ''),
    address: text(raw.address, 'Address', { min: 5, max: 200 }),
    city: text(raw.city, 'City', { max: 100 }),
    state: text(raw.state, 'State', { max: 60 }),
    notes: text(raw.notes, 'Notes', { max: 500, required: false }),
  };

  if (!EMAIL_PATTERN.test(customer.email)) {
    throw new AppError(400, 'Enter a valid email address');
  }
  if (!PHONE_PATTERN.test(customer.phone)) {
    throw new AppError(400, 'Enter a valid Nigerian phone number');
  }

  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 50) {
    throw new AppError(400, 'Order must contain between 1 and 50 items');
  }

  const items = body.items.map((item) => {
    const productId = Number(item?.productId);
    const quantity = Number(item?.quantity);

    if (!Number.isInteger(productId) || productId < 1) {
      throw new AppError(400, 'Each item needs a valid productId');
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      throw new AppError(400, 'Each item needs a quantity between 1 and 100');
    }

    return { productId, quantity };
  });

  return { customer, items };
}

export async function createOrder(req, res) {
  const input = validateOrder(req.body);
  const order = await createOrderRecord(input);
  res.status(201).json(order);
}