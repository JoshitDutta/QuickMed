const BASE_URL = 'http://127.0.0.1:5002/api';
let token = '';
let supplierId = '';
let medicineId = '';
let orderId = '';

async function runTests() {
    console.log('Starting Full Flow Tests...');

    // 1. Login
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@test.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    if (!loginData.token) throw new Error('Login failed');
    token = loginData.token;
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    console.log('Login successful.');

    // 2. Dashboard Initial Stats
    const dashRes1 = await fetch(`${BASE_URL}/dashboard/stats`, { headers });
    const dashData1 = await dashRes1.json();
    console.log('Initial Medicines:', dashData1.totalMedicines);

    // 3. Create Supplier
    const suppRes = await fetch(`${BASE_URL}/suppliers`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: 'Test Supplier', contact: '123', email: 'supp@test.com' })
    });
    const suppData = await suppRes.json();
    supplierId = suppData._id;
    console.log('Created Supplier:', supplierId);

    // 4. Create Medicine
    const medRes = await fetch(`${BASE_URL}/medicines`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            name: 'Test Med',
            category: 'General',
            manufacturer: 'Manuf',
            batch_number: 'BATCH-' + Date.now(),
            quantity: 100,
            price: 10,
            purchase_price: 5,
            expiry_date: '2025-12-31',
            supplier_id: supplierId
        })
    });
    const medData = await medRes.json();
    medicineId = medData._id;
    console.log('Created Medicine:', medicineId);

    // 5. Create Order
    console.log('Creating Order (Qty: 10)...');
    const orderRes = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            customer_name: 'Customer 1',
            items: [{ medicine_id: medicineId, quantity: 10 }],
            payment_status: 'paid'
        })
    });
    const orderData = await orderRes.json();
    orderId = orderData._id;
    console.log('Order Created. Total:', orderData.total_amount); // Should be 10 * 10 = 100

    // 6. Verify Stock Deduction
    const medCheckRes = await fetch(`${BASE_URL}/medicines?search=Test Med`, { headers });
    const medCheckData = await medCheckRes.json();
    const updatedMed = medCheckData.medicines.find(m => m._id === medicineId);
    console.log('Updated Stock:', updatedMed.quantity); // Should be 90

    // 7. Verify Sales Record using Dashboard (Todays Sales)
    const dashRes2 = await fetch(`${BASE_URL}/dashboard/stats`, { headers });
    const dashData2 = await dashRes2.json();
    console.log('Todays Sales (Dashboard):', dashData2.todaysSales); // Should be >= 100

    // 8. Verify Sales API
    const salesRes = await fetch(`${BASE_URL}/sales`, { headers });
    const salesData = await salesRes.json();
    console.log('Sales Records Found:', salesData.sales.length);
    console.log('Total Revenue (Analytics):', salesData.analytics.totalRevenue);

}

runTests().catch(e => console.error(e));
