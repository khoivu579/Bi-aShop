class Order {
  constructor({
    id = null,
    userId = null,
    totalAmount = 0,
    shippingAddress = '',
    paymentMethod = 'CASH',
    status = 'PENDING',
    createdAt = null,
  } = {}) {
    this.id = id;
    this.userId = userId;
    this.totalAmount = totalAmount;
    this.shippingAddress = shippingAddress;
    this.paymentMethod = paymentMethod;
    this.status = status;
    this.createdAt = createdAt;
  }

  static fromDbRow(row = {}) {
    return new Order({
      id: row.id,
      userId: row.user_id,
      totalAmount: row.total_amount,
      shippingAddress: row.shipping_address,
      paymentMethod: row.payment_method,
      status: row.status,
      createdAt: row.created_at,
    });
  }
}

function normalizeCheckoutPayload(payload = {}) {
  const shippingAddress = String(payload.shippingAddress || '').trim();
  const paymentMethod = String(payload.paymentMethod || 'CASH').trim().toUpperCase();
  const allowedPaymentMethods = ['CASH', 'BANK'];

  if (!shippingAddress) {
    const err = new Error('shippingAddress is required');
    err.statusCode = 400;
    throw err;
  }

  if (!allowedPaymentMethods.includes(paymentMethod)) {
    const err = new Error(`paymentMethod must be one of: ${allowedPaymentMethods.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  return {
    shippingAddress,
    paymentMethod,
  };
}

function normalizeOrderStatus(status) {
  const allowed = ['PENDING', 'SHIPPING', 'WAITING_APPROVE', 'COMPLETED', 'CANCELLED'];
  const normalized = String(status || '').toUpperCase();

  if (!allowed.includes(normalized)) {
    const err = new Error(`Status must be one of: ${allowed.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  return normalized;
}

module.exports = {
  Order,
  normalizeCheckoutPayload,
  normalizeOrderStatus,
};
