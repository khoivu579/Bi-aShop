const { User, normalizeRegisterPayload, normalizeLoginPayload, toPublicUser } = require('./user.model');
const { Product, normalizeProductPayload } = require('./product.model');
const { Cart, normalizeCartItemPayload, toCartResponse } = require('./cart.model');
const { CartItem, normalizeCartItemQuantity } = require('./cartItem.model');
const { Order, normalizeCheckoutPayload, normalizeOrderStatus } = require('./order.model');
const { OrderItem, calculateOrderTotal } = require('./orderItem.model');
const { Payment, toPaymentSummary } = require('./payment.model');
const { Auth, assertPasswordPolicy, normalizeEmail } = require('./auth.model');
const { Role, APP_ROLES, isAdmin } = require('./role.model');
const { ensurePositiveInt } = require('./common.model');

module.exports = {
  User,
  Product,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Payment,
  Auth,
  Role,
  APP_ROLES,
  normalizeRegisterPayload,
  normalizeLoginPayload,
  toPublicUser,
  normalizeProductPayload,
  normalizeCartItemPayload,
  normalizeCartItemQuantity,
  toCartResponse,
  normalizeCheckoutPayload,
  normalizeOrderStatus,
  calculateOrderTotal,
  toPaymentSummary,
  assertPasswordPolicy,
  normalizeEmail,
  isAdmin,
  ensurePositiveInt,
};
