const orderRepository = require('../repositories/order.repository');
const paymentRepository = require('../repositories/payment.repository');
const { toPaymentSummary, isAdmin } = require('../models');
const {
  getVietnamDateString,
  addMinutes,
  buildVnpayUrl,
  verifyVnpaySignature,
} = require('../utils/vnpay');

function getVnpayConfig() {
  const tmnCode = process.env.VNPAY_TMN_CODE;
  const hashSecret = process.env.VNPAY_HASH_SECRET;
  const vnpayUrl = process.env.VNPAY_URL;
  const returnUrl = process.env.VNPAY_RETURN_URL;

  if (!tmnCode || !hashSecret || !vnpayUrl || !returnUrl) {
    const err = new Error('VNPay is not configured. Please set VNPAY_TMN_CODE, VNPAY_HASH_SECRET, VNPAY_URL, VNPAY_RETURN_URL');
    err.statusCode = 500;
    throw err;
  }

  return {
    tmnCode,
    hashSecret,
    vnpayUrl,
    returnUrl,
  };
}

async function getPaymentsByOrder(orderId, user) {
  const order = await orderRepository.findById(orderId);
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  if (!isAdmin(user) && Number(order.user_id) !== Number(user.id)) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  const payments = await paymentRepository.findByOrderId(orderId);
  return toPaymentSummary(payments);
}

async function payOrder(orderId, user) {
  const order = await orderRepository.findById(orderId);
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  if (!isAdmin(user) && Number(order.user_id) !== Number(user.id)) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  const payments = await paymentRepository.findByOrderId(orderId);
  const pending = payments.find((item) => item.status !== 'PAID');
  if (!pending) {
    return { message: 'Order is already paid', ...toPaymentSummary(payments) };
  }

  await paymentRepository.markPaid(pending.id);
  const updatedPayments = await paymentRepository.findByOrderId(orderId);

  return {
    message: 'Payment successful',
    ...toPaymentSummary(updatedPayments),
  };
}

async function createVnpayPaymentUrl(orderId, user, ipAddr) {
  const order = await orderRepository.findById(orderId);
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  if (!isAdmin(user) && Number(order.user_id) !== Number(user.id)) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  const orderPaymentMethod = String(order.payment_method || '').trim().toUpperCase();
  if (orderPaymentMethod !== 'BANK') {
    const err = new Error(`VNPay is only available for BANK payment method. Current method: ${orderPaymentMethod || 'UNKNOWN'}`);
    err.statusCode = 400;
    throw err;
  }

  const payments = await paymentRepository.findByOrderId(orderId);
  const pending = payments.find((item) => item.status !== 'PAID');
  if (!pending) {
    return { message: 'Order is already paid', paymentUrl: null };
  }

  const { tmnCode, hashSecret, vnpayUrl, returnUrl } = getVnpayConfig();
  const now = new Date();
  const createDate = getVietnamDateString(now);
  const expireDate = getVietnamDateString(addMinutes(now, 15));
  const txnRef = `${orderId}-${Date.now()}`;
  const amount = Math.round(Number(pending.amount) * 100);

  const params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
    vnp_OrderType: 'billpayment',
    vnp_Amount: amount,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  const paymentUrl = buildVnpayUrl({ params, vnpayUrl, hashSecret });

  return {
    paymentUrl,
    orderId,
    amount: pending.amount,
  };
}

async function handleVnpayReturn(query) {
  const { hashSecret } = getVnpayConfig();
  const isValid = verifyVnpaySignature(query, hashSecret);
  if (!isValid) {
    const err = new Error('Invalid VNPay signature');
    err.statusCode = 400;
    throw err;
  }

  const responseCode = String(query.vnp_ResponseCode || '99');
  const txnRef = String(query.vnp_TxnRef || '');
  const orderId = Number(txnRef.split('-')[0]);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    const err = new Error('Invalid VNPay transaction reference');
    err.statusCode = 400;
    throw err;
  }

  const order = await orderRepository.findById(orderId);
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  if (responseCode === '00') {
    const payments = await paymentRepository.findByOrderId(orderId);
    const pending = payments.find((item) => item.status !== 'PAID');
    if (pending) {
      await paymentRepository.markPaid(pending.id);
    }
  }

  return {
    orderId,
    responseCode,
    message: responseCode === '00' ? 'VNPay payment success' : 'VNPay payment failed',
  };
}

module.exports = {
  getPaymentsByOrder,
  payOrder,
  createVnpayPaymentUrl,
  handleVnpayReturn,
};
