const express = require('express');
const orderController = require('../controllers/order.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(authMiddleware);
router.post('/checkout', roleMiddleware(ROLES.USER), orderController.checkout);
router.get('/my', roleMiddleware(ROLES.USER), orderController.getMyOrders);
router.patch('/:id/confirm-received', roleMiddleware(ROLES.USER), orderController.confirmReceived);
router.get('/staff', roleMiddleware(ROLES.STAFF), orderController.getStaffOrders);
router.patch('/:id/staff-status', roleMiddleware(ROLES.STAFF), orderController.updateStatusByStaff);

module.exports = router;
