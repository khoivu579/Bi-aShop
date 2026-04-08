const express = require('express');
const productController = require('../controllers/product.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', authMiddleware, roleMiddleware(ROLES.ADMIN), productController.createProduct);
router.put('/:id', authMiddleware, roleMiddleware(ROLES.ADMIN), productController.updateProduct);
router.delete('/:id', authMiddleware, roleMiddleware(ROLES.ADMIN), productController.deleteProduct);

module.exports = router;
