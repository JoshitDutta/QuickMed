const Supplier = require('../models/Supplier');

// POST /api/suppliers
exports.createSupplier = async (req, res) => {
    try {
        const supplier = new Supplier(req.body);
        await supplier.save();
        res.status(201).json(supplier);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Server error creating supplier' });
    }
};

// GET /api/suppliers
exports.getSuppliers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;

        const query = {};
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const suppliers = await Supplier.find(query)
            .skip(skip)
            .limit(limitNum);

        const total = await Supplier.countDocuments(query);

        res.json({
            suppliers,
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalSuppliers: total
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching suppliers' });
    }
};

// PUT /api/suppliers/:id
exports.updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.json(supplier);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Server error updating supplier' });
    }
};

// DELETE /api/suppliers/:id
exports.deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndDelete(req.params.id);
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.json({ message: 'Supplier deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error deleting supplier' });
    }
};
