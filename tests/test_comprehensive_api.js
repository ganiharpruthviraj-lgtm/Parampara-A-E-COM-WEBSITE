const http = require('http');

function request(options, body = null) {
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    req.on('error', (err) => resolve({ error: err.message }));
    if (body) {
      if (typeof body === 'object') {
        req.setHeader('Content-Type', 'application/json');
        req.write(JSON.stringify(body));
      } else {
        req.write(body);
      }
    }
    req.end();
  });
}

async function runComprehensiveTests() {
  console.log('--- 1. Testing Products API ---');
  let res = await request({ hostname: 'localhost', port: 5000, path: '/api/products', method: 'GET' });
  console.log('GET /api/products:', res.status);
  let firstProductId = null;
  try {
    const json = JSON.parse(res.data);
    console.log('Total Products in DB:', json.count);
    if (json.products && json.products.length > 0) {
      firstProductId = json.products[0]._id;
      console.log('First Product ID:', firstProductId, json.products[0].name);
    }
  } catch (e) {
    console.error('Products parse error:', e.message);
  }

  if (firstProductId) {
    res = await request({ hostname: 'localhost', port: 5000, path: `/api/products/${firstProductId}`, method: 'GET' });
    console.log(`GET /api/products/${firstProductId}:`, res.status);
  }

  console.log('\n--- 2. Testing Auth API ---');
  // Register demo user
  const testEmail = `test_collector_${Date.now()}@parampara.in`;
  res = await request({
    hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST'
  }, { name: 'Test Collector', email: testEmail, password: 'password123' });
  console.log('POST /api/auth/register:', res.status);
  let token = null;
  try {
    const json = JSON.parse(res.data);
    token = json.token;
    console.log('Register success, got token:', !!token);
  } catch (e) {}

  // Login demo user
  res = await request({
    hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST'
  }, { email: testEmail, password: 'password123' });
  console.log('POST /api/auth/login:', res.status);

  // Profile with token
  if (token) {
    res = await request({
      hostname: 'localhost', port: 5000, path: '/api/auth/profile', method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('GET /api/auth/profile (with token):', res.status);
  }

  // OTP flow
  res = await request({
    hostname: 'localhost', port: 5000, path: '/api/auth/send-otp', method: 'POST'
  }, { phone: '9876543210' });
  console.log('POST /api/auth/send-otp:', res.status);

  res = await request({
    hostname: 'localhost', port: 5000, path: '/api/auth/verify-otp', method: 'POST'
  }, { phone: '9876543210', otp: '123456' });
  console.log('POST /api/auth/verify-otp:', res.status);

  console.log('\n--- 3. Testing Orders API & PDF Certificate ---');
  const orderPayload = {
    orderItems: [
      {
        name: 'Bidriware Silver Inlay Vase',
        price: 24500,
        qty: 1,
        giNumber: 'GI/2006/001'
      }
    ],
    shippingAddress: {
      fullName: 'Ankush Sharma',
      address: 'Heritage Enclave',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      phone: '9876543210'
    },
    paymentMethod: 'Razorpay UPI',
    itemsPrice: 24500,
    totalPrice: 24500
  };

  res = await request({
    hostname: 'localhost', port: 5000, path: '/api/orders', method: 'POST'
  }, orderPayload);
  console.log('POST /api/orders:', res.status);
  let orderId = null;
  try {
    const json = JSON.parse(res.data);
    orderId = json.data ? json.data._id : (json._id || null);
    console.log('Order created ID:', orderId);
  } catch (e) {
    console.log('Create order response:', res.data);
  }

  if (orderId) {
    res = await request({ hostname: 'localhost', port: 5000, path: `/api/orders/${orderId}`, method: 'GET' });
    console.log(`GET /api/orders/${orderId}:`, res.status);

    res = await request({ hostname: 'localhost', port: 5000, path: `/api/orders/${orderId}/invoice-pdf`, method: 'GET' });
    console.log(`GET /api/orders/${orderId}/invoice-pdf:`, res.status, 'Content-Type:', res.headers['content-type'], 'Bytes:', res.data.length);
  }

  console.log('\n--- 4. Testing GI Verification API ---');
  res = await request({ hostname: 'localhost', port: 5000, path: '/api/gi/verify/hp-kullu-shawl-01', method: 'GET' });
  console.log('GET /api/gi/verify/hp-kullu-shawl-01:', res.status);

  console.log('\n--- 5. Testing Mitra Chatbot & Saathi API ---');
  res = await request({
    hostname: 'localhost', port: 5000, path: '/api/chat', method: 'POST'
  }, { message: 'I want a wedding gift from Karnataka under 10000' });
  console.log('POST /api/chat:', res.status);
  try {
    const json = JSON.parse(res.data);
    console.log('Mitra reply preview:', json.reply.slice(0, 150).replace(/\n/g, ' '));
  } catch (e) {}

  res = await request({
    hostname: 'localhost', port: 5000, path: '/api/saathi/chat', method: 'POST'
  }, { message: 'Tell me the history of Channapatna toys' });
  console.log('POST /api/saathi/chat:', res.status);
  try {
    const json = JSON.parse(res.data);
    console.log('Saathi reply preview:', (json.message || json.text || json.reply || JSON.stringify(json)).slice(0, 150).replace(/\n/g, ' '));
  } catch (e) {}
}

runComprehensiveTests();
