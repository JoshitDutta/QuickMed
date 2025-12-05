// Native fetch is available in Node 18+ 
// Node 18+ has native fetch. Let's assume Node recent version or install node-fetch if needed.
// Actually, earlier I installed 'express' etc. I didn't install 'node-fetch'. 
// I'll use standard http or just install node-fetch quickly to be safe, or use axios if I had installed it.
// I'll try to use native fetch assuming Node 18+. If not, I'll fallback or use a simple http request.
// Wait, I can install axios or node-fetch. Let's install node-fetch.
// Actually, I can just use a simple script using 'http' module to avoid dependencies, but it's verbose. 
// Let's rely on native fetch (Node 18 is standard now).

async function testAuth() {
    const BASE_URL = 'http://127.0.0.1:5002/api/auth';

    // 1. Register
    console.log('1. Registering new user...');
    const registerRes = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: 'testadmin',
            email: 'admin@test.com',
            password: 'password123',
            role: 'admin'
        })
    });
    const registerText = await registerRes.text();
    try {
        const registerData = JSON.parse(registerText);
        console.log('Register Response:', registerRes.status, registerData);
    } catch (e) {
        console.error('Failed to parse register response:', registerText);
    }

    // 2. Login
    console.log('\n2. Logging in...');
    const loginRes = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin@test.com',
            password: 'password123'
        })
    });
    const loginData = await loginRes.json();
    console.log('Login Response:', loginRes.status);

    if (loginData.token) {
        console.log('Token received.');

        // 3. Verify Token
        console.log('\n3. Verifying token...');
        const verifyRes = await fetch(`${BASE_URL}/verify`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${loginData.token}` }
        });
        const verifyData = await verifyRes.json();
        console.log('Verify Response:', verifyRes.status, verifyData);
    } else {
        console.error('Login failed, cannot verify token.');
    }

    // 4. Test Invalid Token
    console.log('\n4. Testing invalid token...');
    const invalidRes = await fetch(`${BASE_URL}/verify`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer invalid_token' }
    });
    console.log('Invalid Token Response:', invalidRes.status);
}

testAuth().catch(err => console.error(err));
