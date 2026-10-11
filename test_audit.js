const http = require('http');

async function testEndpoint(url, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: method,
      headers: body ? { 'Content-Type': 'application/json' } : {}
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data: data.slice(0, 120) });
      });
    });
    req.on('error', (err) => resolve({ error: err.message }));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  const tests = [
    { url: 'http://localhost:5000/api/products' },
    { url: 'http://localhost:5000/api/products?state=Karnataka' },
    { url: 'http://localhost:5000/api/chat', method: 'POST', body: { message: 'Show sandalwood crafts' } },
    { url: 'http://localhost:5000/api/saathi/chat', method: 'POST', body: { message: 'Namaste' } },
    { url: 'http://localhost:5000/api/orders' },
    { url: 'http://localhost:5000/api/auth/me' },
    { url: 'http://localhost:5000/index.html' },
    { url: 'http://localhost:5000/search.html' },
    { url: 'http://localhost:5000/checkout.html' },
    { url: 'http://localhost:5000/masterpiece.html' },
    { url: 'http://localhost:5000/karnataka.html' },
    { url: 'http://localhost:5000/states.html' }
  ];

  for (const t of tests) {
    const method = t.method || 'GET';
    const res = await testEndpoint(t.url, method, t.body);
    console.log(`[${method}] ${t.url} -> Status: ${res.status || res.error} | Data: ${res.data ? res.data.replace(/\s+/g, ' ').trim() : ''}`);
  }
}
run();
