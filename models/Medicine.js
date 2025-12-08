const mongoose = require('mongoose');
const MedicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        index: true 
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
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true,
        index: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});
MedicineSchema.index({ name: 'text', category: 'text' });
MedicineSchema.index({ batch_number: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
module.exports = mongoose.model('Medicine', MedicineSchema);
