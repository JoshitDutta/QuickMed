const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Route: POST /api/auth/register
router.post('/register', authController.register);

// Route: POST /api/auth/login
router.post('/login', authController.login);

// Route: POST /api/auth/logout
router.post('/logout', authController.logout);

// Route: GET /api/auth/verify
router.get('/verify', verifyToken, authController.verify);

module.exports = router;
