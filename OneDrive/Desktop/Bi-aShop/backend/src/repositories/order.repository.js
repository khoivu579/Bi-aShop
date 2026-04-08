const { getRequest, sql } = require('../config/db');

async function createOrder({ userId, totalAmount, address, paymentMethod, status }) {
  const result = await getRequest()
    .input('userId', sql.Int, userId)
    .input('totalAmount', sql.Decimal(12, 2), totalAmount)
    .input('address', sql.NVarChar, address)
    .input('paymentMethod', sql.NVarChar, paymentMethod)
    .input('status', sql.NVarChar, status)
    .query(`
      INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, status)
      OUTPUT INSERTED.id
      VALUES (@userId, @totalAmount, @address, @paymentMethod, @status)
    `);

  return result.recordset[0].id;
}

async function createOrderItem({ orderId, productId, quantity, unitPrice }) {
  await getRequest()
    .input('orderId', sql.Int, orderId)
    .input('productId', sql.Int, productId)
    .input('quantity', sql.Int, quantity)
    .input('unitPrice', sql.Decimal(12, 2), unitPrice)
    .query(`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price)
      VALUES (@orderId, @productId, @quantity, @unitPrice)
    `);
}

async function findById(orderId) {
  const result = await getRequest()
    .input('orderId', sql.Int, orderId)
    .query(`
      SELECT o.id, o.user_id, o.total_amount, o.shipping_address, o.payment_method, o.status, o.created_at,
             u.full_name, u.email
      FROM orders o
      JOIN app_users u ON u.id = o.user_id
      WHERE o.id = @orderId
    `);

  return result.recordset[0] || null;
}

async function findItemsByOrderId(orderId) {
  const result = await getRequest()
    .input('orderId', sql.Int, orderId)
    .query(`
      SELECT oi.id, oi.order_id, oi.product_id, oi.quantity, oi.unit_price,
             p.name, p.brand, p.image_url
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = @orderId
      ORDER BY oi.id DESC
    `);

  return result.recordset;
}

async function findByUserId(userId) {
  const result = await getRequest()
    .input('userId', sql.Int, userId)
    .query(`
      SELECT id, user_id, total_amount, shipping_address, payment_method, status, created_at
      FROM orders
      WHERE user_id = @userId
      ORDER BY id DESC
    `);

  return result.recordset;
}

async function findAll() {
  const result = await getRequest().query(`
    SELECT o.id, o.user_id, o.total_amount, o.shipping_address, o.payment_method, o.status, o.created_at,
           u.full_name, u.email
    FROM orders o
    JOIN app_users u ON u.id = o.user_id
    ORDER BY o.id DESC
  `);

  return result.recordset;
}

async function updateStatus(orderId, status) {
  const result = await getRequest()
    .input('orderId', sql.Int, orderId)
    .input('status', sql.NVarChar, status)
    .query('UPDATE orders SET status = @status WHERE id = @orderId');

  return result.rowsAffected[0] > 0;
}

module.exports = {
  createOrder,
  createOrderItem,
  findById,
  findItemsByOrderId,
  findByUserId,
  findAll,
  updateStatus,
};
