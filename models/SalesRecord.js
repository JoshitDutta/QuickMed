const mongoose = require('mongoose');

const SalesRecordSchema = new mongoose.Schema({
    sale_id: {
        type: String, // Or ObjectId if auto-generated, but user said sale_id
        required: true,
        unique: true
    },
    order_id: {
        type: mongoose.Schema.Types.ObjectId, // Assuming linking to Order model
        ref: 'Order',
        required: true
    },
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
    unit_price: {
        type: Number,
        required: true,
        min: 0
    },
    total: { // Line total
        type: Number,
        required: true,
        min: 0
    },
    sale_date: {
        type: Date,
        default: Date.now,
        index: true
    },
    staff_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
    }
});

// Index to quickly find sales by date range or for a specific medicine
// sale_date is already indexed in the field definition
SalesRecordSchema.index({ medicine_id: 1 });

module.exports = mongoose.model('SalesRecord', SalesRecordSchema);
