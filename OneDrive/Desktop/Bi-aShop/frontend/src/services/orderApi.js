import { request, authHeader } from './api';

export function checkout(payload, token) {
  return request('/orders/checkout', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  });
}

export function getMyOrders(token) {
  return request('/orders/my', {
    headers: authHeader(token),
  });
}

export function getAllOrders(token) {
  return request('/orders', {
    headers: authHeader(token),
  });
}

export function updateOrderStatus(orderId, status, token) {
  return request(`/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify({ status }),
  });
}

export function getStaffOrders(token) {
  return request('/orders/staff', {
    headers: authHeader(token),
  });
}

export function updateStaffOrderStatus(orderId, status, token) {
  return request(`/orders/${orderId}/staff-status`, {
    method: 'PATCH',
    headers: authHeader(token),
    body: JSON.stringify({ status }),
  });
}

export function confirmReceivedOrder(orderId, token) {
  return request(`/orders/${orderId}/confirm-received`, {
    method: 'PATCH',
    headers: authHeader(token),
  });
}
