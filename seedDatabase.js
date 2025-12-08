const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/quickmed')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));
const Medicine = require('./models/Medicine');
const Order = require('./models/Order');
const getRandomDate = (daysFromNow, variance = 30) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow + Math.floor(Math.random() * variance));
    return date;
};
const getPastDate = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date;
};
const seedData = async () => {
    try {
        console.log('🗑️  Clearing existing data...');
        await Medicine.deleteMany({});
        await Order.deleteMany({});
        await Order.deleteMany({});
        console.log(' Getting staff member...');
        const Staff = require('./models/Staff');
        let staff = await Staff.findOne();
        if (!staff) {
            console.log('⚠️  No staff found, creating default staff member...');
            staff = await Staff.create({
                username: 'Owner', 
                email: 'owner@quickmed.com',
                password_hash: '$2b$10$YourHashHere', 
                password_hash: '$2b$10$x.z... (placeholder)',
                role: 'admin', 
                phone: '9999999999',
                salary: 50000
            });
        }
        const staffId = staff._id;
        console.log('�💊 Creating 30 medicines...');
        const lowStockMedicines = [
            { name: 'Paracetamol 500mg', category: 'Painkiller', manufacturer: 'PharmaCorp', batch_number: 'PC2024001', quantity: 5, price: 2.50, purchase_price: 1.50, expiry_date: getRandomDate(180, 60), reorder_level: 20 },
            { name: 'Ibuprofen 400mg', category: 'Painkiller', manufacturer: 'MediLife', batch_number: 'ML2024002', quantity: 8, price: 3.00, purchase_price: 1.80, expiry_date: getRandomDate(200, 50), reorder_level: 15 },
            { name: 'Aspirin 75mg', category: 'Cardiovascular', manufacturer: 'CardioMed', batch_number: 'CM2024003', quantity: 3, price: 1.50, purchase_price: 0.90, expiry_date: getRandomDate(150, 40), reorder_level: 25 },
            { name: 'Metformin 500mg', category: 'Cardiovascular', manufacturer: 'DiabetCare', batch_number: 'DC2024004', quantity: 12, price: 4.50, purchase_price: 2.70, expiry_date: getRandomDate(220, 30), reorder_level: 30 },
            { name: 'Amoxicillin 250mg', category: 'Antibiotic', manufacturer: 'AntiBio Labs', batch_number: 'AB2024005', quantity: 6, price: 5.00, purchase_price: 3.00, expiry_date: getRandomDate(90, 20), reorder_level: 20 },
            { name: 'Cetirizine 10mg', category: 'Antibiotic', manufacturer: 'AllergyFree', batch_number: 'AF2024006', quantity: 4, price: 2.00, purchase_price: 1.20, expiry_date: getRandomDate(160, 40), reorder_level: 15 },
            { name: 'Omeprazole 20mg', category: 'Supplement', manufacturer: 'GastroHealth', batch_number: 'GH2024007', quantity: 7, price: 3.50, purchase_price: 2.10, expiry_date: getRandomDate(140, 30), reorder_level: 20 },
            { name: 'Vitamin D3 1000IU', category: 'Supplement', manufacturer: 'VitaBoost', batch_number: 'VB2024008', quantity: 9, price: 6.00, purchase_price: 3.60, expiry_date: getRandomDate(300, 60), reorder_level: 25 },
            { name: 'Insulin Glargine', category: 'Cardiovascular', manufacturer: 'DiabetCare', batch_number: 'DC2024009', quantity: 2, price: 45.00, purchase_price: 27.00, expiry_date: getRandomDate(60, 15), reorder_level: 10 },
            { name: 'Salbutamol Inhaler', category: 'First Aid', manufacturer: 'RespiCare', batch_number: 'RC2024010', quantity: 5, price: 12.00, purchase_price: 7.20, expiry_date: getRandomDate(120, 30), reorder_level: 15 }
        ];
        const expiringSoonMedicines = [
            { name: 'Azithromycin 500mg', category: 'Antibiotic', manufacturer: 'AntiBio Labs', batch_number: 'AB2024011', quantity: 50, price: 8.00, purchase_price: 4.80, expiry_date: getRandomDate(5, 10), reorder_level: 20 },
            { name: 'Ciprofloxacin 500mg', category: 'Antibiotic', manufacturer: 'PharmaCorp', batch_number: 'PC2024012', quantity: 40, price: 6.50, purchase_price: 3.90, expiry_date: getRandomDate(8, 8), reorder_level: 15 },
            { name: 'Doxycycline 100mg', category: 'Antibiotic', manufacturer: 'MediLife', batch_number: 'ML2024013', quantity: 35, price: 5.50, purchase_price: 3.30, expiry_date: getRandomDate(12, 6), reorder_level: 20 },
            { name: 'Losartan 50mg', category: 'Cardiovascular', manufacturer: 'CardioMed', batch_number: 'CM2024014', quantity: 60, price: 7.00, purchase_price: 4.20, expiry_date: getRandomDate(15, 7), reorder_level: 25 },
            { name: 'Atorvastatin 20mg', category: 'Cardiovascular', manufacturer: 'CardioMed', batch_number: 'CM2024015', quantity: 45, price: 9.00, purchase_price: 5.40, expiry_date: getRandomDate(18, 5), reorder_level: 30 },
            { name: 'Levothyroxine 100mcg', category: 'Supplement', manufacturer: 'ThyroidCare', batch_number: 'TC2024016', quantity: 55, price: 4.00, purchase_price: 2.40, expiry_date: getRandomDate(20, 4), reorder_level: 20 },
            { name: 'Ranitidine 150mg', category: 'Supplement', manufacturer: 'GastroHealth', batch_number: 'GH2024017', quantity: 38, price: 3.00, purchase_price: 1.80, expiry_date: getRandomDate(22, 3), reorder_level: 15 },
            { name: 'Diclofenac Gel', category: 'Skin Care', manufacturer: 'DermaCare', batch_number: 'DM2024018', quantity: 42, price: 8.50, purchase_price: 5.10, expiry_date: getRandomDate(25, 2), reorder_level: 20 },
            { name: 'Hydrocortisone Cream', category: 'Skin Care', manufacturer: 'DermaCare', batch_number: 'DM2024019', quantity: 30, price: 6.00, purchase_price: 3.60, expiry_date: getRandomDate(27, 2), reorder_level: 15 },
            { name: 'Cough Syrup', category: 'First Aid', manufacturer: 'RespiCare', batch_number: 'RC2024020', quantity: 25, price: 5.00, purchase_price: 3.00, expiry_date: getRandomDate(28, 1), reorder_level: 20 }
        ];
        lowStockMedicines.forEach(m => m.user_id = staffId);
        expiringSoonMedicines.forEach(m => m.user_id = staffId);
        const normalStockMedicines = [
            { name: 'Multivitamin Tablets', category: 'Supplement', manufacturer: 'VitaBoost', batch_number: 'VB2024021', quantity: 150, price: 10.00, purchase_price: 6.00, expiry_date: getRandomDate(365, 90), reorder_level: 30 },
            { name: 'Calcium Carbonate 500mg', category: 'Supplement', manufacturer: 'VitaBoost', batch_number: 'VB2024022', quantity: 120, price: 4.50, purchase_price: 2.70, expiry_date: getRandomDate(400, 80), reorder_level: 25 },
            { name: 'Folic Acid 5mg', category: 'Supplement', manufacturer: 'VitaBoost', batch_number: 'VB2024023', quantity: 100, price: 3.00, purchase_price: 1.80, expiry_date: getRandomDate(350, 70), reorder_level: 20 },
            { name: 'Amlodipine 5mg', category: 'Cardiovascular', manufacturer: 'CardioMed', batch_number: 'CM2024024', quantity: 200, price: 5.50, purchase_price: 3.30, expiry_date: getRandomDate(300, 60), reorder_level: 40 },
            { name: 'Lisinopril 10mg', category: 'Cardiovascular', manufacturer: 'CardioMed', batch_number: 'CM2024025', quantity: 180, price: 6.00, purchase_price: 3.60, expiry_date: getRandomDate(320, 65), reorder_level: 35 },
            { name: 'Clopidogrel 75mg', category: 'Cardiovascular', manufacturer: 'CardioMed', batch_number: 'CM2024026', quantity: 160, price: 12.00, purchase_price: 7.20, expiry_date: getRandomDate(280, 55), reorder_level: 30 },
            { name: 'Levofloxacin 500mg', category: 'Antibiotic', manufacturer: 'AntiBio Labs', batch_number: 'AB2024027', quantity: 90, price: 9.50, purchase_price: 5.70, expiry_date: getRandomDate(250, 50), reorder_level: 25 },
            { name: 'Clindamycin 300mg', category: 'Antibiotic', manufacturer: 'AntiBio Labs', batch_number: 'AB2024028', quantity: 75, price: 11.00, purchase_price: 6.60, expiry_date: getRandomDate(270, 52), reorder_level: 20 },
            { name: 'Antiseptic Solution', category: 'First Aid', manufacturer: 'FirstAid Plus', batch_number: 'FA2024029', quantity: 140, price: 7.50, purchase_price: 4.50, expiry_date: getRandomDate(450, 100), reorder_level: 30 },
            { name: 'Bandage Roll', category: 'First Aid', manufacturer: 'FirstAid Plus', batch_number: 'FA2024030', quantity: 200, price: 2.50, purchase_price: 1.50, expiry_date: getRandomDate(500, 120), reorder_level: 50 }
        ];
        normalStockMedicines.forEach(m => m.user_id = staffId);
        const allMedicines = [...lowStockMedicines, ...expiringSoonMedicines, ...normalStockMedicines];
        const createdMedicines = await Medicine.insertMany(allMedicines);
        console.log(`✅ Created ${createdMedicines.length} medicines`);
        console.log('📋 Creating 20 orders...');
        const customerNames = [
            'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vikram Singh',
            'Anjali Gupta', 'Rahul Verma', 'Pooja Desai', 'Arjun Nair', 'Kavita Iyer',
            'Sanjay Mehta', 'Deepa Joshi', 'Karan Malhotra', 'Ritu Kapoor', 'Manish Agarwal',
            'Neha Chopra', 'Suresh Rao', 'Divya Menon', 'Rohit Bhatia', 'Meera Pillai'
        ];
        const contacts = [
            '9876543210', '9123456789', '9988776655', '9876512345', '9765432109',
            '9654321098', '9543210987', '9432109876', '9321098765', '9210987654',
            '9109876543', '9098765432', '8987654321', '8876543210', '8765432109',
            '8654321098', '8543210987', '8432109876', '8321098765', '8210987654'
        ];
        const orders = [];
        for (let i = 0; i < 20; i++) {
            const numItems = Math.floor(Math.random() * 4) + 1;
            const selectedMedicines = [];
            const usedIndices = new Set();
            while (selectedMedicines.length < numItems) {
                const randomIndex = Math.floor(Math.random() * createdMedicines.length);
                if (!usedIndices.has(randomIndex)) {
                    usedIndices.add(randomIndex);
                    selectedMedicines.push(createdMedicines[randomIndex]);
                }
            }
            const items = selectedMedicines.map(med => ({
                medicine_id: med._id,
                quantity: Math.floor(Math.random() * 3) + 1,
                price: med.price
            }));
            const total_amount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
            orders.push({
                order_id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                customer_name: customerNames[i],
                customer_contact: contacts[i],
                items: items,
                total_amount: total_amount,
                payment_method: Math.random() > 0.5 ? 'cash' : 'card',
                payment_status: Math.random() > 0.2 ? 'paid' : 'pending',
                staff_id: staffId,
                createdAt: getPastDate(Math.floor(Math.random() * 60))
            });
        }
        const createdOrders = await Order.insertMany(orders);
        console.log(`✅ Created ${createdOrders.length} orders`);
        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Low Stock Medicines: 10`);
        console.log(`   - Expiring Soon Medicines: 10`);
        console.log(`   - Normal Stock Medicines: 10`);
        console.log(`   - Total Orders: 20`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};
seedData();
