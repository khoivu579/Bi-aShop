import { request, authHeader } from './api';

export function getUsers(token) {
  return request('/users', {
    headers: authHeader(token),
  });
}

export function createUser(payload, token) {
  return request('/users', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  });
}

export function updateUser(id, payload, token) {
  return request(`/users/${id}`, {
    method: 'PUT',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  });
}

export function deleteUser(id, token) {
  return request(`/users/${id}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
}
