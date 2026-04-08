class Payment {
  constructor({
    id = null,
    orderId = null,
    amount = 0,
    method = 'CASH',
    status = 'PENDING',
    paidAt = null,
    createdAt = null,
  } = {}) {
    this.id = id;
    this.orderId = orderId;
    this.amount = amount;
    this.method = method;
    this.status = status;
    this.paidAt = paidAt;
    this.createdAt = createdAt;
  }

  static fromDbRow(row = {}) {
    return new Payment({
      id: row.id,
      orderId: row.order_id,
      amount: row.amount,
      method: row.method,
      status: row.status,
      paidAt: row.paid_at,
      createdAt: row.created_at,
    });
  }
}

function toPaymentSummary(payments = []) {
  const isPaid = payments.length > 0 && payments.every((item) => item.status === 'PAID');
  return {
    isPaid,
    payments,
  };
}

module.exports = {
  Payment,
  toPaymentSummary,
};
