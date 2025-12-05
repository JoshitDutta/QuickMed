const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.put('/:id', orderController.updateOrderStatus);

module.exports = router;
