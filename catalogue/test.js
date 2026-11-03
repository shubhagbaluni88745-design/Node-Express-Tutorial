// test.js -- Comprehensive Automated Test Suite for CampusEats Catalogue
const assert = require('assert');

// Start the server
const app = require('./server');

const BASE_URL = 'http://localhost:3000';

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('====================================================');
  console.log('Starting Test Suite for CampusEats Catalogue (CS543)');
  console.log('====================================================\n');

  // Allow server to bind
  await wait(500);

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`[PASS] Test Case ${total}: ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] Test Case ${total}: ${name}`);
      console.error('       Error:', err.message);
    }
  }

  // Test Case 1: Server started successfully
  await test('Server starts successfully on port 3000', async () => {
    const res = await fetch(`${BASE_URL}/items`);
    assert.strictEqual(res.status, 200, 'Server responded to /items');
  });

  // Test Case 2: Open homepage - CampusEats Catalogue appears
  await test('Open homepage (GET /) returns HTML containing "CampusEats Catalogue"', async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert.strictEqual(res.status, 200, 'Homepage status 200');
    const text = await res.text();
    assert.ok(text.includes('CampusEats Catalogue'), 'Page contains "CampusEats Catalogue"');
    assert.ok(text.includes('id="addForm"'), 'Page contains add dish form');
    assert.ok(text.includes('id="list"'), 'Page contains dishes list');
  });

  // Test Case 3: GET /items returns the initial dishes
  await test('GET /items returns initial sample dishes with 200 OK', async () => {
    const res = await fetch(`${BASE_URL}/items`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data), 'Response is an array');
    assert.strictEqual(data.length >= 2, true, 'At least 2 initial dishes');
    assert.deepStrictEqual(data[0], { id: 1, name: 'Veg Thali', price: 90 });
    assert.deepStrictEqual(data[1], { id: 2, name: 'Paneer Roll', price: 70 });
  });

  // Test Case 4: GET /items/1 returns Veg Thali
  await test('GET /items/1 returns dish with ID 1', async () => {
    const res = await fetch(`${BASE_URL}/items/1`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.deepStrictEqual(data, { id: 1, name: 'Veg Thali', price: 90 });
  });

  // Test Case 5: GET /items/99 returns 404 {"error": "not found"}
  await test('GET /items/99 returns HTTP 404 with {"error":"not found"}', async () => {
    const res = await fetch(`${BASE_URL}/items/99`);
    assert.strictEqual(res.status, 404, 'Status should be 404');
    const data = await res.json();
    assert.deepStrictEqual(data, { error: 'not found' });
  });

  // Test Case 6: POST /items creates "Masala Dosa" with price 60
  await test('POST /items adds a new dish and returns HTTP 201', async () => {
    const res = await fetch(`${BASE_URL}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Masala Dosa', price: 60 }),
    });
    assert.strictEqual(res.status, 201, 'Status should be 201 Created');
    const data = await res.json();
    assert.strictEqual(data.id, 3, 'ID should be 3');
    assert.strictEqual(data.name, 'Masala Dosa');
    assert.strictEqual(data.price, 60);
  });

  // Test Case 7: POST /items with missing name returns HTTP 422
  await test('POST /items with missing name returns HTTP 422 with {"error":"name required"}', async () => {
    const res = await fetch(`${BASE_URL}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: 60 }),
    });
    assert.strictEqual(res.status, 422, 'Status should be 422 Unprocessable Entity');
    const data = await res.json();
    assert.deepStrictEqual(data, { error: 'name required' });
  });

  // Test Case 8: Frontend integration - Masala Dosa now appears in GET /items
  await test('Frontend integration: GET /items now contains newly added dish', async () => {
    const res = await fetch(`${BASE_URL}/items`);
    const data = await res.json();
    const dosa = data.find(item => item.id === 3);
    assert.ok(dosa, 'Newly created dish is present in catalogue');
    assert.strictEqual(dosa.name, 'Masala Dosa');
    assert.strictEqual(dosa.price, 60);
  });

  // Test Case 9: Add multiple dishes - unique incrementing IDs
  await test('Add multiple dishes: Each receives a unique incrementing ID', async () => {
    const res1 = await fetch(`${BASE_URL}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Chole Bhature', price: 80 }),
    });
    assert.strictEqual(res1.status, 201);
    const dish1 = await res1.json();
    assert.strictEqual(dish1.id, 4);

    const res2 = await fetch(`${BASE_URL}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Samosa', price: 20 }),
    });
    assert.strictEqual(res2.status, 201);
    const dish2 = await res2.json();
    assert.strictEqual(dish2.id, 5);

    const listRes = await fetch(`${BASE_URL}/items`);
    const list = await listRes.json();
    assert.strictEqual(list.length, 5, 'Total 5 dishes in catalogue');
  });

  console.log('\n====================================================');
  console.log(`Test Results: ${passed}/${total} passed`);
  console.log('====================================================');

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

