const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const BASE_URL = 'http://localhost:3000';

const log = (label, data) => {
  console.log(`\n=== ${label} ===`);
  console.log(JSON.stringify(data, null, 2));
};

async function main() {
  try {
    // 1) Register admin
    let res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'password123',
        role: 'ADMIN',
      }),
    });
    let body = await res.json();
    log('Register Admin', { status: res.status, body });

    // 2) Login admin
    res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'password123',
      }),
    });
    body = await res.json();
    log('Login Admin', { status: res.status, body });

    const adminToken = body.accessToken;

    // 3) Register employee
    res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Employee One',
        email: 'emp@test.com',
        password: 'password123',
        role: 'EMPLOYEE',
      }),
    });
    body = await res.json();
    log('Register Employee', { status: res.status, body });

    const employeeId = body.id;

    // 4) Create customer
    res = await fetch(`${BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Test Customer',
        email: 'customer@test.com',
        phone: '7777777777',
        company: 'Test Co',
      }),
    });
    body = await res.json();
    log('Create Customer', { status: res.status, body });

    const customerId = body.id;

    // 5) Create task
    res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Follow up call',
        description: 'Call the customer tomorrow',
        assignedTo: employeeId,
        customerId,
        status: 'PENDING',
      }),
    });
    body = await res.json();
    log('Create Task', { status: res.status, body });

    // 6) Get tasks as admin
    res = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    body = await res.json();
    log('Get Tasks as Admin', { status: res.status, body });

    console.log('\nSmoke test finished.');
  } catch (err) {
    console.error('Smoke test failed:', err);
  }
}

main();
