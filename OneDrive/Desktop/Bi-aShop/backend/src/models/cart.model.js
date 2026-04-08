class Cart {
  constructor({ id = null, userId = null, createdAt = null, updatedAt = null } = {}) {
    this.id = id;
    this.userId = userId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromDbRow(row = {}) {
    return new Cart({
      id: row.id,
      userId: row.user_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}

function normalizeCartItemPayload(payload = {}) {
  const productId = Number(payload.productId);
  const quantity = Math.max(1, Number(payload.quantity || 1));

  if (!Number.isInteger(productId) || !Number.isInteger(quantity)) {
    const err = new Error('Invalid productId or quantity');
    err.statusCode = 400;
    throw err;
  }

  return { productId, quantity };
}

function toCartResponse(items = []) {
  const totalAmount = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  return { items, totalAmount };
}

module.exports = {
  Cart,
  normalizeCartItemPayload,
  toCartResponse,
};
