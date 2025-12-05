const mongoose = require('mongoose');
const Medicine = require('./models/Medicine');
const Supplier = require('./models/Supplier');
const Order = require('./models/Order');
const Staff = require('./models/Staff');
const SalesRecord = require('./models/SalesRecord');

async function testSchemas() {
    console.log('Testing schema validation...');

    // Test Medicine
    const medicine = new Medicine({
        name: 'Paracetamol',
        category: 'Painkiller',
        manufacturer: 'PharmaCorp',
        batch_number: 'B123',
        quantity: 100,
        price: 5.0,
        purchase_price: 3.0,
        expiry_date: new Date('2025-12-31')
    });
    await medicine.validate();
    console.log('Medicine schema valid.');

    // Test Supplier
    const supplier = new Supplier({
        name: 'MediSupply',
        contact: '1234567890',
        email: 'info@medisupply.com',
        address: '123 Supply St'
    });
    await supplier.validate();
    console.log('Supplier schema valid.');

    // Test Staff
    const staff = new Staff({
        username: 'admin_user',
        email: 'admin@quickmed.com',
        password_hash: 'hashedpassword123',
        role: 'admin'
    });
    await staff.validate();
    console.log('Staff schema valid.');

    // Test Order (Requires valid object IDs for validation of types usually, but let's try with generated ones)
    const order = new Order({
        order_id: 'ORD-001',
        customer_name: 'John Doe',
        items: [{
            medicine_id: new mongoose.Types.ObjectId(),
            quantity: 2,
            price: 5.0
        }],
        total_amount: 10.0,
        staff_id: new mongoose.Types.ObjectId()
    });
    await order.validate();
    console.log('Order schema valid.');

    // Test SalesRecord
    const salesRecord = new SalesRecord({
        sale_id: 'SALE-001',
        order_id: new mongoose.Types.ObjectId(),
        medicine_id: new mongoose.Types.ObjectId(),
        quantity: 2,
        unit_price: 5.0,
        total: 10.0,
        staff_id: new mongoose.Types.ObjectId()
    });
    await salesRecord.validate();
    console.log('SalesRecord schema valid.');

    console.log('All schemas passed validation!');
}

testSchemas().catch(err => {
    console.error('Validation failed:', err);
    process.exit(1);
});
