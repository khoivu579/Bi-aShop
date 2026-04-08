const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.get('/vnpay-return', paymentController.vnpayReturn);

router.use(authMiddleware);
router.use(roleMiddleware(ROLES.USER));
router.get('/order/:orderId', paymentController.getByOrder);
router.post('/order/:orderId/pay', paymentController.pay);
router.post('/order/:orderId/vnpay-url', paymentController.createVnpayUrl);

module.exports = router;
