const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const User = require('../models/User');

process.env.JWT_SECRET = 'test_jwt_secret_key_12345';

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Authentication API & JWT Verification', () => {

  describe('POST /api/auth/register', () => {
    it('should successfully register a new user and return a JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Ankush Sharma',
          email: 'ankush@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe('Ankush Sharma');
      expect(res.body.email).toBe('ankush@example.com');
      expect(res.body).toHaveProperty('token');
    });

    it('should reject registration with duplicate email', async () => {
      await User.create({
        name: 'Existing User',
        email: 'duplicate@example.com',
        password: 'password123',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'duplicate@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/already exists/i);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Login User',
        email: 'login@example.com',
        password: 'password123',
      });
    });

    it('should authenticate user with valid credentials and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toBe('login@example.com');
    });

    it('should reject login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/invalid/i);
    });

    it('should reject login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/invalid/i);
    });
  });

  describe('GET /api/auth/profile (JWT Authorization)', () => {
    let token;
    let userId;

    beforeEach(async () => {
      const user = await User.create({
        name: 'Profile User',
        email: 'profile@example.com',
        password: 'password123',
      });
      userId = user._id.toString();

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'profile@example.com', password: 'password123' });
      
      token = loginRes.body.token;
    });

    it('should return user profile when valid Bearer JWT is provided', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(userId);
      expect(res.body.email).toBe('profile@example.com');
    });

    it('should return 401 when Authorization header is missing', async () => {
      const res = await request(app)
        .get('/api/auth/profile');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/not authorized/i);
    });

    it('should return 401 when malformed or invalid token is provided', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid_token_xyz');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST & GET /api/auth/collection (Personal Collection)', () => {
    let token;

    beforeEach(async () => {
      const user = await User.create({
        name: 'Collector User',
        email: 'collector@example.com',
        password: 'password123',
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'collector@example.com', password: 'password123' });

      token = loginRes.body.token;
    });

    it('should add item to collection when authorized', async () => {
      const mockProductId = '60d5ec49f1b2c8112c8b4567';
      const res = await request(app)
        .post(`/api/auth/collection/${mockProductId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.isCollected).toBe(true);
      expect(res.body.collections).toContain(mockProductId);
    });

    it('should remove item from collection on second toggle', async () => {
      const mockProductId = '60d5ec49f1b2c8112c8b4567';
      
      // Add
      await request(app)
        .post(`/api/auth/collection/${mockProductId}`)
        .set('Authorization', `Bearer ${token}`);

      // Remove
      const res = await request(app)
        .post(`/api/auth/collection/${mockProductId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.isCollected).toBe(false);
      expect(res.body.collections).not.toContain(mockProductId);
    });
  });
});
