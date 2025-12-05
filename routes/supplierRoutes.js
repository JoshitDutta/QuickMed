const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.post('/', supplierController.createSupplier);
router.get('/', supplierController.getSuppliers);
router.put('/:id', supplierController.updateSupplier);
router.delete('/:id', supplierController.deleteSupplier);

module.exports = router;
