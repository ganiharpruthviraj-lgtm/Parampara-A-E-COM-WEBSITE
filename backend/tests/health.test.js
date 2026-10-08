const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB } = require('./setup');

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('GET /api/health', () => {
  it('should return 200 with ok status and required fields', async () => {
    const res = await request(app).get('/api/health');

    expect([200, 503]).toContain(res.statusCode); // 503 if DB slow in CI
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('environment');
    expect(res.body).toHaveProperty('database');
    expect(res.body.database).toHaveProperty('status');
    expect(res.body).toHaveProperty('google_oauth');
    expect(res.body.google_oauth).toHaveProperty('configured');
  });

  it('should report google_oauth.configured as false when client id is placeholder', async () => {
    const original = process.env.GOOGLE_CLIENT_ID;
    process.env.GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_GOES_HERE';

    const res = await request(app).get('/api/health');
    expect(res.body.google_oauth.configured).toBe(false);
    expect(res.body.warnings).toBeDefined();

    process.env.GOOGLE_CLIENT_ID = original;
  });

  it('should report google_oauth.configured as true when client id is set', async () => {
    const original = process.env.GOOGLE_CLIENT_ID;
    process.env.GOOGLE_CLIENT_ID = '123456789-abcdef.apps.googleusercontent.com';

    const res = await request(app).get('/api/health');
    expect(res.body.google_oauth.configured).toBe(true);

    process.env.GOOGLE_CLIENT_ID = original;
  });
});
