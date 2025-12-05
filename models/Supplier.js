const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    contact: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    address: {
        type: String,
        trim: true
    },
    medicines_supplied: [{
        type: String // Storing medicine names or categories as tags
        // Alternatively can be ObjectId ref if tight coupling is needed
    }]
}, {
    timestamps: true // adds createdAt and updatedAt automatically but we can override naming if strictly needed, user asked specific fields for others but generic for this maybe? Let's stick to standard timestamps but if user asked specifically for created_at we should use that option globally or here. User didn't specify timestamps for Supplier explicitly but "medicines_supplied" etc.
});

module.exports = mongoose.model('Supplier', SupplierSchema);
