const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff');
exports.register = async (req, res) => {
    try {
        let { username, email, password, role, name } = req.body;
        if (!username && name) {
            username = name;
        }
        if (role) {
            role = role.toLowerCase();
            if (role === 'owner') role = 'admin';
        }
        const existingUser = await Staff.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with that email or username' });
        }
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const staff = new Staff({
            username,
            email,
            password_hash,
            role: role || 'staff' 
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
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const staff = await Staff.findOne({ email });
        if (!staff) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, staff.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const payload = {
            id: staff._id,
            username: staff.username,
            role: staff.role
        };
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
exports.logout = (req, res) => {
    res.status(200).json({ message: 'Logout successful' });
};
exports.verify = (req, res) => {
    res.status(200).json({ valid: true, user: req.user });
};
