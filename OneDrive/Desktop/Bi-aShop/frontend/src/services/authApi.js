import { request, authHeader } from './api';

export function loginApi(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function registerApi(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getMe(token) {
  return request('/auth/me', {
    headers: authHeader(token),
  });
}
