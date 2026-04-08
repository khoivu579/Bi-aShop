const cartRepository = require('../repositories/cart.repository');
const productRepository = require('../repositories/product.repository');
const { normalizeCartItemPayload, toCartResponse, normalizeCartItemQuantity } = require('../models');

async function getMyCart(userId) {
  const cartId = await cartRepository.ensureCart(userId);
  const items = await cartRepository.findItemsByCartId(cartId);
  return toCartResponse(items);
}

async function addItem(userId, payload) {
  const { productId, quantity } = normalizeCartItemPayload(payload);

  const product = await productRepository.findById(productId);
  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  const cartId = await cartRepository.ensureCart(userId);
  const existed = await cartRepository.findCartItem(cartId, productId);

  if (existed) {
    await cartRepository.updateCartItemQuantity(existed.id, existed.quantity + quantity);
  } else {
    await cartRepository.createCartItem(cartId, productId, quantity);
  }

  const items = await cartRepository.findItemsByCartId(cartId);
  return toCartResponse(items);
}

async function updateItem(userId, itemId, payload) {
  const quantity = normalizeCartItemQuantity(payload.quantity);

  const item = await cartRepository.findCartItemById(itemId);
  if (!item) {
    const err = new Error('Cart item not found');
    err.statusCode = 404;
    throw err;
  }

  const cartId = await cartRepository.ensureCart(userId);
  if (item.cart_id !== cartId) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  await cartRepository.updateCartItemQuantity(itemId, quantity);
  const items = await cartRepository.findItemsByCartId(cartId);
  return toCartResponse(items);
}

async function removeItem(userId, itemId) {
  const item = await cartRepository.findCartItemById(itemId);
  if (!item) {
    const err = new Error('Cart item not found');
    err.statusCode = 404;
    throw err;
  }

  const cartId = await cartRepository.ensureCart(userId);
  if (item.cart_id !== cartId) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  await cartRepository.deleteCartItem(itemId);
  const items = await cartRepository.findItemsByCartId(cartId);
  return toCartResponse(items);
}

module.exports = {
  getMyCart,
  addItem,
  updateItem,
  removeItem,
};
