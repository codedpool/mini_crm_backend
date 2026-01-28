const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

let adminToken;

beforeAll(async () => {
  // Clean DB if you want (optional, careful in real env)
  await prisma.task.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // Register admin
  await request(app).post('/auth/register').send({
    name: 'Admin Jest',
    email: 'adminjest@example.com',
    password: 'password123',
    role: 'ADMIN',
  });

  // Login admin
  const res = await request(app).post('/auth/login').send({
    email: 'adminjest@example.com',
    password: 'password123',
  });

  adminToken = res.body.accessToken;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Auth & Customers', () => {
  test('login returns JWT and user', () => {
    expect(adminToken).toBeDefined();
  });

  test('ADMIN can create a customer', async () => {
    const res = await request(app)
      .post('/customers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Jest Customer',
        email: 'jestcustomer@example.com',
        phone: '7000000000',
        company: 'Jest Co',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe('jestcustomer@example.com');
  });

  test('customers list supports pagination and search', async () => {
    const res = await request(app)
      .get('/customers?search=jest')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
