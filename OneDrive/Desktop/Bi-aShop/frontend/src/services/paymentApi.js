import { request, authHeader } from './api';

export function payOrder(orderId, token) {
  return request(`/payments/order/${orderId}/pay`, {
    method: 'POST',
    headers: authHeader(token),
  });
}

export function getPaymentsByOrder(orderId, token) {
  return request(`/payments/order/${orderId}`, {
    headers: authHeader(token),
  });
}

export function createVnpayUrl(orderId, token) {
  return request(`/payments/order/${orderId}/vnpay-url`, {
    method: 'POST',
    headers: authHeader(token),
  });
}
