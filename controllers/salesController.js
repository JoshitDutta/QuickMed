const SalesRecord = require('../models/SalesRecord');
exports.getSales = async (req, res) => {
    try {
        const { startDate, endDate, medicineId } = req.query;
        const query = { staff_id: req.user.id };
        if (startDate || endDate) {
            query.sale_date = {};
            if (startDate) query.sale_date.$gte = new Date(startDate);
            if (endDate) query.sale_date.$lte = new Date(endDate);
        }
        if (medicineId) {
            query.medicine_id = medicineId;
        }
        const sales = await SalesRecord.find(query)
            .populate('medicine_id', 'name')
            .populate('staff_id', 'username')
            .sort({ sale_date: -1 });
        const revenueData = await SalesRecord.aggregate([
            { $match: query },
            { $group: { _id: null, totalRevenue: { $sum: '$total' }, totalQuantity: { $sum: '$quantity' } } }
        ]);
        const totalRevenue = revenueData.length ? revenueData[0].totalRevenue : 0;
        const totalQuantitySold = revenueData.length ? revenueData[0].totalQuantity : 0;
        res.json({
            sales,
            analytics: {
                totalRevenue,
                totalQuantitySold
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching sales records' });
    }
};
