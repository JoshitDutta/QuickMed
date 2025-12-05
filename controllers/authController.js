const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff');

// Register a new staff member
exports.register = async (req, res) => {
    try {
        let { username, email, password, role, name } = req.body;
        // Frontend sends 'name', Backend expects 'username'. Map them.
        if (!username && name) {
            username = name;
        }

        // Normalize role
        if (role) {
            role = role.toLowerCase();
            if (role === 'owner') role = 'admin';
        }

        // Check if user already exists
        const existingUser = await Staff.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with that email or username' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Create new staff
        const staff = new Staff({
            username,
            email,
            password_hash,
            role: role || 'staff' // Default to staff if not specified, though schema handles default too
        });

        await staff.save();

        res.status(201).json({ message: 'Staff member registered successfully' });
    } catch (err) {
        console.error("Registration Error:", err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find staff by email
        const staff = await Staff.findOne({ email });
        if (!staff) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, staff.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT payload
        const payload = {
            id: staff._id,
            username: staff.username,
            role: staff.role
        };

        // Sign token
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: {
                id: staff._id,
                username: staff.username,
                email: staff.email,
                role: staff.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Logout (Client side should discard token, server just sends 200)
exports.logout = (req, res) => {
    // In a stateless JWT setup, the server doesn't keep track of logged in users usually.
    // One could implement a token blacklist here if needed, but for now we just acknowledge.
    res.status(200).json({ message: 'Logout successful' });
};

// Verify Token
exports.verify = (req, res) => {
    // If middleware passed, req.user is set
    res.status(200).json({ valid: true, user: req.user });
};
