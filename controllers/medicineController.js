const Medicine = require('../models/Medicine');
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
            categories, 
            minPrice,
            maxPrice
        } = req.query;
        const query = {
            isDeleted: false,
            user_id: req.user.id
        };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }
        if (categories) {
            const catArray = categories.split(',').filter(c => c.trim() !== '');
            if (catArray.length > 0) query.category = { $in: catArray };
        } else if (category) {
            query.category = category;
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (filterLowStock === 'true') {
            query.$expr = { $lte: ['$quantity', '$reorder_level'] };
        }
        if (expiryStart || expiryEnd) {
            query.expiry_date = {};
            if (expiryStart) query.expiry_date.$gte = new Date(expiryStart);
            if (expiryEnd) query.expiry_date.$lte = new Date(expiryEnd);
        }
        let sort = { created_at: -1 };
        if (sortBy) {
            const parts = sortBy.split(':');
            const field = parts[0];
            const order = parts[1] === 'desc' ? -1 : 1;
            sort = { [field]: order };
        }
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
exports.createMedicine = async (req, res) => {
    try {
        const medicine = new Medicine({
            ...req.body,
            user_id: req.user.id
        });
        await medicine.validate(); 
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
exports.updateMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        const medicine = await Medicine.findOneAndUpdate(
            { _id: id, user_id: req.user.id },
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
exports.deleteMedicine = async (req, res) => {
    try {
        const { id } = req.params;
        const medicine = await Medicine.findOneAndUpdate(
            { _id: id, user_id: req.user.id },
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
