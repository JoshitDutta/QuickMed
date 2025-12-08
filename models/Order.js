const mongoose = require('mongoose');
const OrderItemSchema = new mongoose.Schema({
    medicine_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: { 
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false });
const OrderSchema = new mongoose.Schema({
    order_id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    customer_name: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    customer_contact: {
        type: String,
        trim: true
    },
    items: [OrderItemSchema],
    total_amount: {
        type: Number,
        required: true,
        min: 0
    },
    payment_status: {
        type: String,
        enum: ['pending', 'paid', 'cancelled'],
        default: 'pending'
    },
    order_date: {
        type: Date,
        default: Date.now,
        index: true
    },
    staff_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
    }
}, {
    timestamps: true 
});
module.exports = mongoose.model('Order', OrderSchema);
