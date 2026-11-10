// test.js -- Comprehensive Automated Test Suite for Secured CampusEats Catalogue
// CS543 Web Services: Tutorial 09 & Tutorial 08 Verification
const assert = require('assert');
const jwt = require('jsonwebtoken');

// Import server
const serverModule = require('./server');
const app = serverModule;

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('================================================================');
  console.log('Starting Test Suite for CampusEats Secured API (CS543 T08 & T09)');
  console.log('================================================================\n');

  // Start the server for testing
  const server = serverModule.startServer(PORT);
  await wait(500);

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`[PASS] Test Case ${total.toString().padStart(2, ' ')}: ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] Test Case ${total.toString().padStart(2, ' ')}: ${name}`);
      console.error('       Error:', err.message);
    }
  }

  let customerToken = '';
  let restaurantToken = '';

  try {
    // 1. Server starts successfully
    await test('Server starts successfully on port 3000', async () => {
      const res = await fetch(`${BASE_URL}/`);
      assert.strictEqual(res.status, 200, 'Server responded with 200 on /');
    });

    // 2. Homepage loads
    await test('Homepage loads with UI elements (CampusEats Catalogue & forms)', async () => {
      const res = await fetch(`${BASE_URL}/`);
      assert.strictEqual(res.status, 200);
      const text = await res.text();
      assert.ok(text.includes('CampusEats Catalogue'), 'Page contains "CampusEats Catalogue"');
      assert.ok(text.includes('id="loginForm"'), 'Page contains loginForm');
      assert.ok(text.includes('id="addForm"'), 'Page contains addForm');
      assert.ok(text.includes('id="list"'), 'Page contains dish list container');
    });

    // 3. Customer login succeeds
    await test('Customer login succeeds (asha@campus.edu)', async () => {
      const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'asha@campus.edu', password: 'customer123' }),
      });
      assert.strictEqual(res.status, 200, 'Login status should be 200');
      const data = await res.json();
      assert.ok(data.token, 'Response contains token');
      customerToken = data.token;

      // Verify token payload
      const payload = jwt.decode(customerToken);
      assert.strictEqual(payload.role, 'customer', 'Token role should be customer');
      assert.strictEqual(payload.sub, 1, 'Token sub should be 1');
    });

    // 4. Restaurant login succeeds
    await test('Restaurant login succeeds (mealhub@campus.edu)', async () => {
      const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'mealhub@campus.edu', password: 'resto123' }),
      });
      assert.strictEqual(res.status, 200, 'Login status should be 200');
      const data = await res.json();
      assert.ok(data.token, 'Response contains token');
      restaurantToken = data.token;

      // Verify token payload
      const payload = jwt.decode(restaurantToken);
      assert.strictEqual(payload.role, 'restaurant', 'Token role should be restaurant');
      assert.strictEqual(payload.sub, 2, 'Token sub should be 2');
    });

    // 5. Invalid login returns 401
    await test('Invalid login returns HTTP 401 {"error":"bad login"}', async () => {
      const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'mealhub@campus.edu', password: 'wrongpassword' }),
      });
      assert.strictEqual(res.status, 401, 'Status should be 401');
      const data = await res.json();
      assert.deepStrictEqual(data, { error: 'bad login' });
    });

    // 6. GET /items without token returns 401
    await test('GET /items without token returns HTTP 401 {"error":"invalid or missing token"}', async () => {
      const res = await fetch(`${BASE_URL}/items`);
      assert.strictEqual(res.status, 401, 'Status should be 401');
      const data = await res.json();
      assert.deepStrictEqual(data, { error: 'invalid or missing token' });
    });

    // 7. GET /items with customer token returns 200
    await test('GET /items with customer token returns HTTP 200 and dish list', async () => {
      const res = await fetch(`${BASE_URL}/items`, {
        headers: { 'Authorization': `Bearer ${customerToken}` },
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data), 'Response is an array');
      assert.strictEqual(data.length >= 2, true);
      assert.deepStrictEqual(data[0], { id: 1, name: 'Veg Thali', price: 90 });
      assert.deepStrictEqual(data[1], { id: 2, name: 'Paneer Roll', price: 70 });
    });

    // 8. GET /items with restaurant token returns 200
    await test('GET /items with restaurant token returns HTTP 200', async () => {
      const res = await fetch(`${BASE_URL}/items`, {
        headers: { 'Authorization': `Bearer ${restaurantToken}` },
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data));
      assert.strictEqual(data.length >= 2, true);
    });

    // 9. GET /items/:id works with valid token
    await test('GET /items/1 with valid token returns dish ID 1 (Veg Thali)', async () => {
      const res = await fetch(`${BASE_URL}/items/1`, {
        headers: { 'Authorization': `Bearer ${customerToken}` },
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.deepStrictEqual(data, { id: 1, name: 'Veg Thali', price: 90 });
    });

    // 10. Invalid item ID returns 404
    await test('GET /items/99 with valid token returns HTTP 404 {"error":"not found"}', async () => {
      const res = await fetch(`${BASE_URL}/items/99`, {
        headers: { 'Authorization': `Bearer ${customerToken}` },
      });
      assert.strictEqual(res.status, 404);
      const data = await res.json();
      assert.deepStrictEqual(data, { error: 'not found' });
    });

    // 11. Restaurant can add dishes (POST /items -> 201)
    await test('Restaurant can add dishes (POST /items -> 201 Created)', async () => {
      const res = await fetch(`${BASE_URL}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${restaurantToken}`,
        },
        body: JSON.stringify({ name: 'Masala Dosa', price: 60 }),
      });
      assert.strictEqual(res.status, 201, 'Status should be 201 Created');
      const data = await res.json();
      assert.strictEqual(data.id, 3);
      assert.strictEqual(data.name, 'Masala Dosa');
      assert.strictEqual(data.price, 60);
    });

    // 12. Customer cannot add dishes (POST /items -> 403 Forbidden)
    await test('Customer cannot add dishes (POST /items -> HTTP 403 {"error":"forbidden"})', async () => {
      const res = await fetch(`${BASE_URL}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`,
        },
        body: JSON.stringify({ name: 'Hack Burger', price: 99 }),
      });
      assert.strictEqual(res.status, 403, 'Status should be 403 Forbidden');
      const data = await res.json();
      assert.deepStrictEqual(data, { error: 'forbidden' });
    });

    // 13. Missing token on POST /items returns 401
    await test('POST /items without token returns HTTP 401 {"error":"invalid or missing token"}', async () => {
      const res = await fetch(`${BASE_URL}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Stealth Dish', price: 50 }),
      });
      assert.strictEqual(res.status, 401);
      const data = await res.json();
      assert.deepStrictEqual(data, { error: 'invalid or missing token' });
    });

    // 14. Missing dish name returns 422
    await test('POST /items with missing dish name returns HTTP 422 {"error":"name required"}', async () => {
      const res = await fetch(`${BASE_URL}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${restaurantToken}`,
        },
        body: JSON.stringify({ price: 60 }),
      });
      assert.strictEqual(res.status, 422, 'Status should be 422');
      const data = await res.json();
      assert.deepStrictEqual(data, { error: 'name required' });
    });

    // 15. Invalid JWT returns 401
    await test('Invalid JWT returns HTTP 401 {"error":"invalid or missing token"}', async () => {
      const res = await fetch(`${BASE_URL}/items`, {
        headers: { 'Authorization': 'Bearer invalid.token.value' },
      });
      assert.strictEqual(res.status, 401);
      const data = await res.json();
      assert.deepStrictEqual(data, { error: 'invalid or missing token' });
    });

    // 16. Expired JWT returns 401
    await test('Expired JWT returns HTTP 401 {"error":"invalid or missing token"}', async () => {
      const secret = serverModule.SECRET;
      const expiredToken = jwt.sign(
        { sub: 1, role: 'customer' },
        secret,
        { expiresIn: '-1s' }
      );
      const res = await fetch(`${BASE_URL}/items`, {
        headers: { 'Authorization': `Bearer ${expiredToken}` },
      });
      assert.strictEqual(res.status, 401);
      const data = await res.json();
      assert.deepStrictEqual(data, { error: 'invalid or missing token' });
    });

    // 17. Malformed Authorization header returns 401
    await test('Malformed Authorization header returns HTTP 401', async () => {
      const testHeaders = [
        'Basic dXNlcjpwYXNz',
        'Bearer',
        'BearerTokenWithoutSpace',
        'Token 12345'
      ];
      for (const h of testHeaders) {
        const res = await fetch(`${BASE_URL}/items`, {
          headers: { 'Authorization': h },
        });
        assert.strictEqual(res.status, 401, `Failed for header: ${h}`);
        const data = await res.json();
        assert.deepStrictEqual(data, { error: 'invalid or missing token' });
      }
    });

    // 18. Modified JWT payload returns 401 (Tampered token signature)
    await test('Modified JWT payload returns HTTP 401 (Signature verification failure)', async () => {
      // Modify payload part of valid customer token
      const parts = customerToken.split('.');
      // Tamper with payload
      const tamperedToken = `${parts[0]}.eyJyZXBsYWNlZCI6dHJ1ZX0.${parts[2]}`;
      const res = await fetch(`${BASE_URL}/items`, {
        headers: { 'Authorization': `Bearer ${tamperedToken}` },
      });
      assert.strictEqual(res.status, 401);
      const data = await res.json();
      assert.deepStrictEqual(data, { error: 'invalid or missing token' });
    });

    // 19. Users cannot elevate their privileges
    await test('Privilege escalation attempt without secret returns HTTP 401', async () => {
      // Attacker tries to forge a token with role 'admin' signed with a fake secret
      const forgedToken = jwt.sign({ sub: 1, role: 'admin' }, 'fake-attacker-secret');
      const res = await fetch(`${BASE_URL}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${forgedToken}`,
        },
        body: JSON.stringify({ name: 'Privilege Escalation Dish', price: 99 }),
      });
      assert.strictEqual(res.status, 401);
      const data = await res.json();
      assert.deepStrictEqual(data, { error: 'invalid or missing token' });
    });

    // 20. Newly created dishes receive unique IDs
    await test('Newly created dishes receive unique sequential IDs', async () => {
      const res1 = await fetch(`${BASE_URL}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${restaurantToken}`,
        },
        body: JSON.stringify({ name: 'Chole Bhature', price: 80 }),
      });
      assert.strictEqual(res1.status, 201);
      const dish1 = await res1.json();
      assert.strictEqual(dish1.id, 4);

      const res2 = await fetch(`${BASE_URL}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${restaurantToken}`,
        },
        body: JSON.stringify({ name: 'Samosa', price: 20 }),
      });
      assert.strictEqual(res2.status, 201);
      const dish2 = await res2.json();
      assert.strictEqual(dish2.id, 5);

      // Verify full list includes all items
      const listRes = await fetch(`${BASE_URL}/items`, {
        headers: { 'Authorization': `Bearer ${restaurantToken}` },
      });
      const list = await listRes.json();
      assert.strictEqual(list.length, 5, 'Total dishes should now be 5');
    });

  } finally {
    serverModule.closeServer();
  }

  console.log('\n================================================================');
  console.log(`Test Results: ${passed}/${total} passed`);
  console.log('================================================================');

  if (passed === total) {
    console.log('All tests passed successfully!');
    process.exit(0);
  } else {
    console.error('Some tests failed.');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
