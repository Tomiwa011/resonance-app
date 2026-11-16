import { createOrder as createOrderRecord } from '../services/orders.service.js';
import { validateOrder } from '../validators/order.validator.js';

export async function createOrder(req, res) {
  const input = validateOrder(req.body);
  const order = await createOrderRecord(input);
  res.status(201).json(order);
}