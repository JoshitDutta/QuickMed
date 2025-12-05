const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
        index: true
    },
    password_hash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'staff'],
        default: 'staff',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    // User specifically asked for created_at, didn't ask for updated_at explicitly but timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } is safer.
    // However, I'll stick to their specific request for Staff: "created_at"
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

module.exports = mongoose.model('Staff', StaffSchema);
