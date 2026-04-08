const { getRequest, sql } = require('../config/db');

async function findCartByUserId(userId) {
  const result = await getRequest()
    .input('userId', sql.Int, userId)
    .query('SELECT id, user_id, created_at, updated_at FROM carts WHERE user_id = @userId');

  return result.recordset[0] || null;
}

async function createCart(userId) {
  const result = await getRequest()
    .input('userId', sql.Int, userId)
    .query('INSERT INTO carts (user_id) OUTPUT INSERTED.id VALUES (@userId)');

  return result.recordset[0].id;
}

async function ensureCart(userId) {
  const existing = await findCartByUserId(userId);
  if (existing) return existing.id;
  return createCart(userId);
}

async function findItemsByCartId(cartId) {
  const result = await getRequest()
    .input('cartId', sql.Int, cartId)
    .query(`
      SELECT ci.id, ci.cart_id, ci.product_id, ci.quantity, ci.created_at,
             p.name, p.brand, p.price, p.stock, p.image_url
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id = @cartId
      ORDER BY ci.id DESC
    `);

  return result.recordset;
}

async function findCartItem(cartId, productId) {
  const result = await getRequest()
    .input('cartId', sql.Int, cartId)
    .input('productId', sql.Int, productId)
    .query('SELECT id, cart_id, product_id, quantity FROM cart_items WHERE cart_id = @cartId AND product_id = @productId');

  return result.recordset[0] || null;
}

async function createCartItem(cartId, productId, quantity) {
  const result = await getRequest()
    .input('cartId', sql.Int, cartId)
    .input('productId', sql.Int, productId)
    .input('quantity', sql.Int, quantity)
    .query(`
      INSERT INTO cart_items (cart_id, product_id, quantity)
      OUTPUT INSERTED.id
      VALUES (@cartId, @productId, @quantity)
    `);

  return result.recordset[0].id;
}

async function updateCartItemQuantity(itemId, quantity) {
  const result = await getRequest()
    .input('itemId', sql.Int, itemId)
    .input('quantity', sql.Int, quantity)
    .query('UPDATE cart_items SET quantity = @quantity WHERE id = @itemId');

  return result.rowsAffected[0] > 0;
}

async function findCartItemById(itemId) {
  const result = await getRequest()
    .input('itemId', sql.Int, itemId)
    .query('SELECT id, cart_id, product_id, quantity FROM cart_items WHERE id = @itemId');

  return result.recordset[0] || null;
}

async function deleteCartItem(itemId) {
  const result = await getRequest()
    .input('itemId', sql.Int, itemId)
    .query('DELETE FROM cart_items WHERE id = @itemId');

  return result.rowsAffected[0] > 0;
}

async function clearCart(cartId) {
  await getRequest()
    .input('cartId', sql.Int, cartId)
    .query('DELETE FROM cart_items WHERE cart_id = @cartId');
}

module.exports = {
  ensureCart,
  findItemsByCartId,
  findCartItem,
  createCartItem,
  updateCartItemQuantity,
  findCartItemById,
  deleteCartItem,
  clearCart,
};
