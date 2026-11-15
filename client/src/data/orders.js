import { apiPost } from '../api/client.js'

// Sends only ids and quantities. The server works out prices and totals itself.
export function createOrder({ customer, items }) {
  return apiPost('/orders', {
    customer,
    items: items.map(({ productId, quantity }) => ({ productId, quantity })),
  })
}