import { request, authHeader, API_ORIGIN } from './api';

export function getProducts(search = '') {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return request(`/products${query}`);
}

export function createProduct(payload, token) {
  return request('/products', {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  });
}

export function updateProduct(id, payload, token) {
  return request(`/products/${id}`, {
    method: 'PUT',
    headers: authHeader(token),
    body: JSON.stringify(payload),
  });
}

export function deleteProduct(id, token) {
  return request(`/products/${id}`, {
    method: 'DELETE',
    headers: authHeader(token),
  });
}

export function resolveProductImageUrl(imageUrl) {
  if (!imageUrl) return 'https://via.placeholder.com/640x360?text=Bi-a+Cue';
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;

  const encodedFileName = imageUrl
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `${API_ORIGIN}/uploads/${encodedFileName}`;
}
