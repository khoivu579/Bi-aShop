const orderService = require('../services/order.service');

async function checkout(req, res, next) {
  try {
    const order = await orderService.checkout(req.user.id, req.body);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}

async function getMyOrders(req, res, next) {
  try {
    const orders = await orderService.getMyOrders(req.user.id);
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

async function getAllOrders(req, res, next) {
  try {
    const orders = await orderService.getAllOrders();
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const order = await orderService.updateOrderStatus(Number(req.params.id), req.body.status);
    res.json(order);
  } catch (error) {
    next(error);
  }
}

async function getStaffOrders(req, res, next) {
  try {
    const orders = await orderService.getStaffOrders();
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

async function updateStatusByStaff(req, res, next) {
  try {
    const order = await orderService.updateOrderStatusByStaff(Number(req.params.id), req.body.status);
    res.json(order);
  } catch (error) {
    next(error);
  }
}

async function confirmReceived(req, res, next) {
  try {
    const order = await orderService.confirmReceivedByUser(Number(req.params.id), req.user.id);
    res.json(order);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  checkout,
  getMyOrders,
  getAllOrders,
  getStaffOrders,
  updateStatus,
  updateStatusByStaff,
  confirmReceived,
};
