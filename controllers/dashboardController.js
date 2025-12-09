const Medicine = require('../models/Medicine');
const Order = require('../models/Order');

exports.getStats = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin';

        // Base query for medicines (Admins see all, Staff see their own)
        const medicineQuery = { isDeleted: false };
        if (!isAdmin) {
            medicineQuery.user_id = req.user.id;
        }

        const totalMedicines = await Medicine.countDocuments(medicineQuery);

        const lowStockCount = await Medicine.countDocuments({
            ...medicineQuery,
            $expr: { $lte: ['$quantity', '$reorder_level'] }
        });

        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiringSoonCount = await Medicine.countDocuments({
            ...medicineQuery,
            expiry_date: { $gte: new Date(), $lte: thirtyDaysFromNow }
        });

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Base match for orders (Admins see all paid orders, Staff see their own)
        const orderMatch = {
            payment_status: 'paid'
        };
        if (!isAdmin) {
            orderMatch.staff_id = req.user.id;
        }

        const matchToday = {
            ...orderMatch,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        };

        const todaysSalesData = await Order.aggregate([
            { $match: matchToday },
            { $group: { _id: null, total: { $sum: '$total_amount' } } }
        ]);
        const todaysSales = todaysSalesData.length > 0 ? todaysSalesData[0].total : 0;

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const matchMonth = {
            ...orderMatch,
            createdAt: { $gte: startOfMonth }
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

