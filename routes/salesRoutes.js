const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', salesController.getSales);

module.exports = router;
