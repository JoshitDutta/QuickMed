const Medicine = require('../models/Medicine');
const Order = require('../models/Order');

// GET /api/dashboard/stats
exports.getStats = async (req, res) => {
    try {
        // 1. Total Medicines (exclude deleted)
        // 1. Total Medicines (exclude deleted)
        const totalMedicines = await Medicine.countDocuments({
            isDeleted: false,
            user_id: req.user.id
        });

        // 2. Low Stock Count
        // Using $expr to compare quantity and reorder_level
        const lowStockCount = await Medicine.countDocuments({
            isDeleted: false,
            user_id: req.user.id,
            $expr: { $lte: ['$quantity', '$reorder_level'] }
        });

        // 3. Expiring Soon Count (e.g., next 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const expiringSoonCount = await Medicine.countDocuments({
            isDeleted: false,
            user_id: req.user.id,
            expiry_date: { $gte: new Date(), $lte: thirtyDaysFromNow }
        });

        // 4. Today's Sales (Revenue)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const matchToday = {
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            payment_status: 'paid',
            staff_id: req.user.id
        };

        const todaysSalesData = await Order.aggregate([
            { $match: matchToday },
            { $group: { _id: null, total: { $sum: '$total_amount' } } }
        ]);
        const todaysSales = todaysSalesData.length > 0 ? todaysSalesData[0].total : 0;

        // 5. Monthly Revenue
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const matchMonth = {
            createdAt: { $gte: startOfMonth },
            payment_status: 'paid',
            staff_id: req.user.id
        };

        const monthlyRevenueData = await Order.aggregate([
            { $match: matchMonth },
            { $group: { _id: null, total: { $sum: '$total_amount' } } }
        ]);
        const monthlyRevenue = monthlyRevenueData.length > 0 ? monthlyRevenueData[0].total : 0;

        res.json({
            totalMedicines,
            lowStockCount,
            expiringSoonCount,
            todaysSales,
            monthlyRevenue
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching dashboard stats' });
    }
};
