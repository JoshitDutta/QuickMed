const Medicine = require('../models/Medicine');

// GET /api/medicines
exports.getMedicines = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            sortBy,
            filterLowStock,
            expiryStart,
            expiryEnd,
            category,
            categories, // Multi-select support
            minPrice,
            maxPrice
        } = req.query;

        const query = { isDeleted: false };

        // Search
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by Category (Single or Multi)
        if (categories) {
            const catArray = categories.split(',').filter(c => c.trim() !== '');
            if (catArray.length > 0) query.category = { $in: catArray };
        } else if (category) {
            query.category = category;
        }

        // Filter by Price Range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Filter Low Stock
        if (filterLowStock === 'true') {
            // In MongoDB we can compare fields using $expr, but simple way is harder if reorder_level varies per doc.
            // Lucky for us, reorder_level IS a field.
            // query['$expr'] = { $lte: ['$quantity', '$reorder_level'] };
            // However, typical request might just want simple threshold.
            // But prompt says "low_stock" alert logic.
            // Let's use $expr to compare quantity vs reorder_level.
            query.$expr = { $lte: ['$quantity', '$reorder_level'] };
        }

        // Filter Expiry Range
        if (expiryStart || expiryEnd) {
            query.expiry_date = {};
            if (expiryStart) query.expiry_date.$gte = new Date(expiryStart);
            if (expiryEnd) query.expiry_date.$lte = new Date(expiryEnd);
        }

        // Sorting
        let sort = { created_at: -1 };
        if (sortBy) {
            const parts = sortBy.split(':');
            const field = parts[0];
            const order = parts[1] === 'desc' ? -1 : 1;
            sort = { [field]: order };
        }

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const medicines = await Medicine.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limitNum);

        const total = await Medicine.countDocuments(query);

        res.json({
            medicines,
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalMedicines: total
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching medicines' });
    }
};

// POST /api/medicines
exports.createMedicine = async (req, res) => {
    try {
        const medicine = new Medicine(req.body);
        await medicine.validate(); // Explicit check though save() does it too
        await medicine.save();
        res.status(201).json(medicine);
    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Server error creating medicine' });
    }
};

// PUT /api/medicines/:id
exports.updateMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        const medicine = await Medicine.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        res.json(medicine);
    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Server error updating medicine' });
    }
};

// DELETE /api/medicines/:id
exports.deleteMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        const medicine = await Medicine.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );

        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        res.json({ message: 'Medicine deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error deleting medicine' });
    }
};
