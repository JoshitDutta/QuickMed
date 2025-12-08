const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { verifyToken } = require('../middleware/authMiddleware');
const checkAlerts = async (req, res, next) => {
    if (req.method === 'GET' && req.path === '/') {
    }
    next();
};
router.use(verifyToken);
router.get('/', medicineController.getMedicines);
router.post('/', medicineController.createMedicine);
router.put('/:id', medicineController.updateMedicine);
router.delete('/:id', medicineController.deleteMedicine);
module.exports = router;
