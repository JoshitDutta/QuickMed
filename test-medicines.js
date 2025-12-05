const BASE_URL = 'http://127.0.0.1:5002/api';
let token = '';

async function runTests() {
    console.log('Starting Medicine API Tests...');

    // 1. Login to get token
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@test.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    if (!loginData.token) throw new Error('Login failed: ' + JSON.stringify(loginData));
    token = loginData.token;
    console.log('Logged in successfully.');

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // 2. Create Medicines
    const med1 = {
        name: 'Amoxicillin',
        category: 'Antibiotic',
        manufacturer: 'PharmaA',
        batch_number: 'AMX001',
        quantity: 50,
        price: 15.0,
        purchase_price: 10.0,
        expiry_date: '2026-05-01',
        reorder_level: 20
    };

    const med2 = {
        name: 'Ibuprofen',
        category: 'Painkiller',
        manufacturer: 'PharmaB',
        batch_number: 'IBU002',
        quantity: 5,
        price: 8.0,
        purchase_price: 5.0,
        expiry_date: '2024-01-01', // Expired/close
        reorder_level: 10
    };

    console.log('Creating medicine 1...');
    const createRes1 = await fetch(`${BASE_URL}/medicines`, { method: 'POST', headers, body: JSON.stringify(med1) });
    const data1 = await createRes1.json();
    console.log('Create Med 1 Check:', createRes1.status); // 201

    console.log('Creating medicine 2...');
    const createRes2 = await fetch(`${BASE_URL}/medicines`, { method: 'POST', headers, body: JSON.stringify(med2) });
    const data2 = await createRes2.json();
    console.log('Create Med 2 Check:', createRes2.status); // 201
    const med2Id = data2._id;

    // 3. List Medicines (Pagination)
    console.log('Listing medicines (Page 1, Limit 5)...');
    const listRes = await fetch(`${BASE_URL}/medicines?page=1&limit=5`, { headers });
    const listData = await listRes.json();
    console.log('List Count:', listData.medicines.length, 'Total:', listData.totalMedicines);

    // 4. Search
    console.log('Searching for "Amox"...');
    const searchRes = await fetch(`${BASE_URL}/medicines?search=Amox`, { headers });
    const searchData = await searchRes.json();
    console.log('Search Result:', searchData.medicines[0]?.name);

    // 5. Filter Low Stock
    console.log('Filtering Low Stock...');
    const lowStockRes = await fetch(`${BASE_URL}/medicines?filterLowStock=true`, { headers });
    const lowStockData = await lowStockRes.json();
    console.log('Low Stock Count:', lowStockData.medicines.length); // Should include Ibuprofen (5 <= 10)

    // 6. Update Medicine
    console.log('Updating Medicine 2 quantity...');
    const updateRes = await fetch(`${BASE_URL}/medicines/${med2Id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ quantity: 100 })
    });
    const updateData = await updateRes.json();
    console.log('Updated Quantity:', updateData.quantity);

    // 7. Delete Medicine (Soft Delete)
    console.log('Deleting Medicine 2...');
    const deleteRes = await fetch(`${BASE_URL}/medicines/${med2Id}`, { method: 'DELETE', headers });
    console.log('Delete Status:', deleteRes.status);

    // 8. Verify Deletion
    const listResAfter = await fetch(`${BASE_URL}/medicines?search=Ibuprofen`, { headers });
    const listDataAfter = await listResAfter.json();
    console.log('Found deleted item in list?', listDataAfter.medicines.length > 0);

}

runTests().catch(e => console.error(e));
