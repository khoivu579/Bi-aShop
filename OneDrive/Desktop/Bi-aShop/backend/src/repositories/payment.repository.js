const { getRequest, sql } = require('../config/db');

async function createPayment({ orderId, amount, method, status }) {
  const result = await getRequest()
    .input('orderId', sql.Int, orderId)
    .input('amount', sql.Decimal(12, 2), amount)
    .input('method', sql.NVarChar, method)
    .input('status', sql.NVarChar, status)
    .query(`
      INSERT INTO payments (order_id, amount, method, status)
      OUTPUT INSERTED.id
      VALUES (@orderId, @amount, @method, @status)
    `);

  return result.recordset[0].id;
}

async function findByOrderId(orderId) {
  const result = await getRequest()
    .input('orderId', sql.Int, orderId)
    .query(`
      SELECT id, order_id, amount, method, status, paid_at, created_at
      FROM payments
      WHERE order_id = @orderId
      ORDER BY id DESC
    `);

  return result.recordset;
}

async function markPaid(paymentId) {
  const result = await getRequest()
    .input('paymentId', sql.Int, paymentId)
    .query(`
      UPDATE payments
      SET status = 'PAID', paid_at = GETDATE()
      WHERE id = @paymentId
    `);

  return result.rowsAffected[0] > 0;
}

module.exports = {
  createPayment,
  findByOrderId,
  markPaid,
};
