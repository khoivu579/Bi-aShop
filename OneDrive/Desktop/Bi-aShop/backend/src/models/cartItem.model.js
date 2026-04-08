class CartItem {
  constructor({ id = null, cartId = null, productId = null, quantity = 1, createdAt = null } = {}) {
    this.id = id;
    this.cartId = cartId;
    this.productId = productId;
    this.quantity = quantity;
    this.createdAt = createdAt;
  }

  static fromDbRow(row = {}) {
    return new CartItem({
      id: row.id,
      cartId: row.cart_id,
      productId: row.product_id,
      quantity: row.quantity,
      createdAt: row.created_at,
    });
  }
}

function normalizeCartItemQuantity(value) {
  const quantity = Math.max(1, Number(value || 1));
  if (!Number.isInteger(quantity)) {
    const err = new Error('Quantity must be integer');
    err.statusCode = 400;
    throw err;
  }
  return quantity;
}

module.exports = {
  CartItem,
  normalizeCartItemQuantity,
};
