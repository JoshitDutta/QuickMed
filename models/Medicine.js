const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        index: true // Simple index will be useful, but text index is better for search
    },
    category: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    manufacturer: {
        type: String,
        required: true,
        trim: true
    },
    batch_number: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    purchase_price: {
        type: Number,
        required: true,
        min: 0
    },
    expiry_date: {
        type: Date,
        required: true,
        index: true
    },
    reorder_level: {
        type: Number,
        default: 10,
        min: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Text index for searching by main fields
MedicineSchema.index({ name: 'text', category: 'text' });

// Partial unique index for batch_number (allows re-using batch if original is deleted)
MedicineSchema.index({ batch_number: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });

module.exports = mongoose.model('Medicine', MedicineSchema);

