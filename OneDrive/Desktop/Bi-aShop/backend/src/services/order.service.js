const cartRepository = require('../repositories/cart.repository');
const orderRepository = require('../repositories/order.repository');
const paymentRepository = require('../repositories/payment.repository');
const productRepository = require('../repositories/product.repository');
const { normalizeCheckoutPayload, normalizeOrderStatus, calculateOrderTotal } = require('../models');

async function getOrderDetail(orderId) {
  const order = await orderRepository.findById(orderId);
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  const items = await orderRepository.findItemsByOrderId(orderId);
  const payments = await paymentRepository.findByOrderId(orderId);

  return { ...order, items, payments };
}

async function checkout(userId, payload) {
  const { shippingAddress, paymentMethod } = normalizeCheckoutPayload(payload);

  const cartId = await cartRepository.ensureCart(userId);
  const cartItems = await cartRepository.findItemsByCartId(cartId);
  if (cartItems.length === 0) {
    const err = new Error('Cart is empty');
    err.statusCode = 400;
    throw err;
  }

  for (const item of cartItems) {
    if (Number(item.quantity) > Number(item.stock)) {
      const err = new Error(`Insufficient stock for ${item.name}`);
      err.statusCode = 400;
      throw err;
    }
  }

  const totalAmount = calculateOrderTotal(cartItems);

  const orderId = await orderRepository.createOrder({
    userId,
    totalAmount,
    address: shippingAddress,
    paymentMethod,
    status: 'PENDING',
  });

  for (const item of cartItems) {
    await orderRepository.createOrderItem({
      orderId,
      productId: item.product_id,
      quantity: item.quantity,
      unitPrice: item.price,
    });

    const stockAdjusted = await productRepository.adjustStock(item.product_id, -Number(item.quantity));
    if (!stockAdjusted) {
      const err = new Error(`Failed to update stock for ${item.name}`);
      err.statusCode = 400;
      throw err;
    }
  }

  const paymentId = await paymentRepository.createPayment({
    orderId,
    amount: totalAmount,
    method: paymentMethod,
    status: 'PENDING',
  });

  if (String(paymentMethod).toUpperCase() === 'CASH') {
    await paymentRepository.markPaid(paymentId);
  }

  await cartRepository.clearCart(cartId);

  const order = await orderRepository.findById(orderId);
  const items = await orderRepository.findItemsByOrderId(orderId);
  const payments = await paymentRepository.findByOrderId(orderId);

  return {
    ...order,
    items,
    payments,
  };
}

async function getMyOrders(userId) {
  const orders = await orderRepository.findByUserId(userId);
  const detailed = [];

  for (const order of orders) {
    detailed.push(await getOrderDetail(order.id));
  }

  return detailed;
}

async function getAllOrders() {
  const orders = await orderRepository.findAll();
  const detailed = [];

  for (const order of orders) {
    detailed.push(await getOrderDetail(order.id));
  }

  return detailed;
}

async function getStaffOrders() {
  const orders = await getAllOrders();
  return orders.filter((order) => ['PENDING', 'SHIPPING', 'WAITING_APPROVE', 'COMPLETED'].includes(order.status));
}

async function updateOrderStatus(orderId, status) {
  const normalized = normalizeOrderStatus(status);

  const updated = await orderRepository.updateStatus(orderId, normalized);
  if (!updated) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  const detail = await getOrderDetail(orderId);

  return detail;
}

async function updateOrderStatusByStaff(orderId, status) {
  const normalized = normalizeOrderStatus(status);
  if (!['SHIPPING', 'WAITING_APPROVE'].includes(normalized)) {
    const err = new Error('STAFF can only update status to SHIPPING or WAITING_APPROVE');
    err.statusCode = 403;
    throw err;
  }

  const current = await orderRepository.findById(orderId);
  if (!current) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  if (normalized === 'SHIPPING' && current.status !== 'PENDING') {
    const err = new Error('Order must be PENDING before SHIPPING');
    err.statusCode = 400;
    throw err;
  }

  if (normalized === 'WAITING_APPROVE' && current.status !== 'SHIPPING') {
    const err = new Error('Order must be SHIPPING before WAITING_APPROVE');
    err.statusCode = 400;
    throw err;
  }

  await orderRepository.updateStatus(orderId, normalized);
  const detail = await getOrderDetail(orderId);

  return detail;
}

async function confirmReceivedByUser(orderId, userId) {
  const current = await orderRepository.findById(orderId);
  if (!current) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  if (Number(current.user_id) !== Number(userId)) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  if (current.status !== 'WAITING_APPROVE') {
    const err = new Error('Order must be WAITING_APPROVE before confirming received');
    err.statusCode = 400;
    throw err;
  }

  await orderRepository.updateStatus(orderId, 'COMPLETED');
  return getOrderDetail(orderId);
}

module.exports = {
  checkout,
  getMyOrders,
  getAllOrders,
  getStaffOrders,
  updateOrderStatus,
  updateOrderStatusByStaff,
  confirmReceivedByUser,
};
