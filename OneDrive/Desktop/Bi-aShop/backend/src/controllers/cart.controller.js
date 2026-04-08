const cartService = require('../services/cart.service');

async function getMyCart(req, res, next) {
  try {
    const cart = await cartService.getMyCart(req.user.id);
    res.json(cart);
  } catch (error) {
    next(error);
  }
}

async function addItem(req, res, next) {
  try {
    const cart = await cartService.addItem(req.user.id, req.body);
    res.json(cart);
  } catch (error) {
    next(error);
  }
}

async function updateItem(req, res, next) {
  try {
    const cart = await cartService.updateItem(req.user.id, Number(req.params.itemId), req.body);
    res.json(cart);
  } catch (error) {
    next(error);
  }
}

async function removeItem(req, res, next) {
  try {
    const cart = await cartService.removeItem(req.user.id, Number(req.params.itemId));
    res.json(cart);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyCart,
  addItem,
  updateItem,
  removeItem,
};
