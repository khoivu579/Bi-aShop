const express = require('express');
const cartController = require('../controllers/cart.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware(ROLES.USER));
router.get('/', cartController.getMyCart);
router.post('/items', cartController.addItem);
router.put('/items/:itemId', cartController.updateItem);
router.delete('/items/:itemId', cartController.removeItem);

module.exports = router;
