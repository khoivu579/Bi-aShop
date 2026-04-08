import { request, authHeader } from './api';

export function getCart(token) {
  return request('/cart', { headers: authHeader(token) });
}

export function addCartItem(payload, token) {
  return request('/cart/items', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  });
}

export function updateCartItem(itemId, payload, token) {
  return request(`/cart/items/${itemId}`, {
    method: 'PUT',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  });
}

export function removeCartItem(itemId, token) {
  return request(`/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
}
