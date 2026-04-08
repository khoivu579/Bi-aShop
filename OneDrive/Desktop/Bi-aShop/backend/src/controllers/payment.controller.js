const paymentService = require('../services/payment.service');
const { getClientIp } = require('../utils/vnpay');

async function getByOrder(req, res, next) {
  try {
    const payments = await paymentService.getPaymentsByOrder(Number(req.params.orderId), req.user);
    res.json(payments);
  } catch (error) {
    next(error);
  }
}

async function pay(req, res, next) {
  try {
    const result = await paymentService.payOrder(Number(req.params.orderId), req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function createVnpayUrl(req, res, next) {
  try {
    const ipAddr = getClientIp(req);
    const result = await paymentService.createVnpayPaymentUrl(Number(req.params.orderId), req.user, ipAddr);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function vnpayReturn(req, res, next) {
  try {
    const result = await paymentService.handleVnpayReturn(req.query);
    res.status(200).send(`
      <html>
        <head><title>VNPay Result</title></head>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <h2>${result.message}</h2>
          <p>Order ID: ${result.orderId}</p>
          <p>Response Code: ${result.responseCode}</p>
          <a href="http://localhost:5173/my-orders">Back to My Orders</a>
        </body>
      </html>
    `);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getByOrder,
  pay,
  createVnpayUrl,
  vnpayReturn,
};
