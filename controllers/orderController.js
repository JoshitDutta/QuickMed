const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const SalesRecord = require('../models/SalesRecord');
const mongoose = require('mongoose');
exports.createOrder = async (req, res) => {
    try {
        const { customer_name, customer_contact, items, payment_status } = req.body;
        const staff_id = req.user.id; 
        let total_amount = 0;
        const orderItems = [];
        for (const item of items) {
            const medicine = await Medicine.findOne({ _id: item.medicine_id, user_id: req.user.id });
            if (!medicine) {
                return res.status(404).json({ message: `Medicine not found or access denied: ${item.medicine_id}` });
            }
            if (medicine.isDeleted) {
                return res.status(400).json({ message: `Medicine is not available: ${medicine.name}` });
            }
            if (medicine.quantity < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${medicine.name}. Available: ${medicine.quantity}` });
            }
            medicine.quantity -= item.quantity;
            await medicine.save();
            const lineTotal = medicine.price * item.quantity;
            total_amount += lineTotal;
            orderItems.push({
                medicine_id: medicine._id,
                quantity: item.quantity,
                price: medicine.price
            });
        }
        const order_id = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const order = new Order({
            order_id,
            customer_name,
            customer_contact,
            items: orderItems,
            total_amount,
            payment_status: payment_status || 'pending',
            staff_id
        });
        await order.save();
        if (order.payment_status === 'paid') {
            for (const item of orderItems) {
                const sale = new SalesRecord({
                    sale_id: `SALE-${Date.now()}-${item.medicine_id}`,
                    order_id: order._id,
                    medicine_id: item.medicine_id,
                    quantity: item.quantity,
                    unit_price: item.price,
                    total: item.quantity * item.price,
                    sale_date: new Date(),
                    staff_id
                });
                await sale.save();
            }
        }
        res.status(201).json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error creating order' });
    }
};
exports.getOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status, startDate, endDate } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        let query = { staff_id: req.user.id };
        if (search) {
            query.$or = [
                { customer_name: { $regex: search, $options: 'i' } },
                { order_id: { $regex: search, $options: 'i' } }
            ];
        }
        if (status) {
            query.payment_status = status;
        }
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
        }
        const orders = await Order.find(query)
            .populate('staff_id', 'username')
            .populate('items.medicine_id', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);
        const total = await Order.countDocuments(query);
        res.json({
            orders,
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalOrders: total
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching orders' });
    }
};
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;
        const order = await Order.findOne({ _id: id, staff_id: req.user.id });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (order.payment_status === 'paid') {
        }
        if (order.payment_status !== 'paid' && payment_status === 'paid') {
            for (const item of order.items) {
                const sale = new SalesRecord({
                    sale_id: `SALE-${Date.now()}-${item.medicine_id}`,
                    order_id: order._id,
                    medicine_id: item.medicine_id,
                    quantity: item.quantity,
                    unit_price: item.price,
                    total: item.quantity * item.price,
                    sale_date: new Date(),
                    staff_id: order.staff_id
                });
                await sale.save();
            }
        }
        if (payment_status === 'cancelled' && order.payment_status !== 'cancelled') {
            for (const item of order.items) {
                const medicine = await Medicine.findOne({ _id: item.medicine_id, user_id: req.user.id });
                if (medicine) {
                    medicine.quantity += item.quantity;
                    await medicine.save();
                }
            }
        }
        order.payment_status = payment_status;
        await order.save();
        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating order' });
    }
}
