const mongoose = require('mongoose');
const SalesRecordSchema = new mongoose.Schema({
    sale_id: {
        type: String, 
        required: true,
        unique: true
    },
    order_id: {
        type: mongoose.Schema.Types.ObjectId, 
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
    total: { 
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
SalesRecordSchema.index({ medicine_id: 1 });
module.exports = mongoose.model('SalesRecord', SalesRecordSchema);
