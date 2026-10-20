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

  describe('GET /api/auth/config & POST /api/auth/google', () => {
    it('should return google auth config status from GET /api/auth/config', async () => {
      const res = await request(app).get('/api/auth/config');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('googleClientId');
      expect(res.body).toHaveProperty('isGoogleConfigured');
    });

    it('should return 400 when GOOGLE_CLIENT_ID is not properly configured', async () => {
      const originalClientId = process.env.GOOGLE_CLIENT_ID;
      process.env.GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_GOES_HERE';

      const res = await request(app)
        .post('/api/auth/google')
        .send({ token: 'dummy_token' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Google OAuth is not configured/i);

      process.env.GOOGLE_CLIENT_ID = originalClientId;
    });
  });

  describe('Password Recovery: POST /api/auth/forgot-password & /api/auth/reset-password', () => {
    let testUserEmail = 'recovery_test@example.com';
    let testUserPassword = 'oldPassword123';

    beforeEach(async () => {
      await User.create({
        name: 'Recovery Collector',
        email: testUserEmail,
        password: testUserPassword,
      });
    });

    it('should generate an OTP confirmation for valid email identifier', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ identifier: testUserEmail });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('provider');
      expect(res.body).toHaveProperty('identifier', testUserEmail);
    });

    it('should reject forgot-password request when identifier is missing', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/required/i);
    });

    it('should reject forgot-password request for invalid short phone number', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ identifier: '12345' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/valid/i);
    });

    it('should successfully reset password with valid OTP and issue new token', async () => {
      // Step 1: Request OTP
      const forgotRes = await request(app)
        .post('/api/auth/forgot-password')
        .send({ identifier: testUserEmail });

      expect(forgotRes.statusCode).toBe(200);
      const generatedOtp = forgotRes.body.demoCode || '123456';

      // Step 2: Reset password
      const resetRes = await request(app)
        .post('/api/auth/reset-password')
        .send({
          identifier: testUserEmail,
          otp: generatedOtp,
          newPassword: 'newSecretPassword456'
        });

      expect(resetRes.statusCode).toBe(200);
      expect(resetRes.body.success).toBe(true);
      expect(resetRes.body).toHaveProperty('token');

      // Step 3: Verify login works with new password
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserEmail,
          password: 'newSecretPassword456'
        });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body).toHaveProperty('token');
    });

    it('should allow password reset with universal backup code 123456', async () => {
      const resetRes = await request(app)
        .post('/api/auth/reset-password')
        .send({
          identifier: testUserEmail,
          otp: '123456',
          newPassword: 'backupPassword789'
        });

      expect(resetRes.statusCode).toBe(200);
      expect(resetRes.body.success).toBe(true);
      expect(resetRes.body).toHaveProperty('token');
    });

    it('should reject password reset when OTP is invalid', async () => {
      const resetRes = await request(app)
        .post('/api/auth/reset-password')
        .send({
          identifier: testUserEmail,
          otp: '999999',
          newPassword: 'attemptedPassword123'
        });

      expect(resetRes.statusCode).toBe(400);
      expect(resetRes.body.message).toMatch(/invalid or expired/i);
    });

    it('should reject password reset when new password is too short', async () => {
      const resetRes = await request(app)
        .post('/api/auth/reset-password')
        .send({
          identifier: testUserEmail,
          otp: '123456',
          newPassword: '123'
        });

      expect(resetRes.statusCode).toBe(400);
      expect(resetRes.body.message).toMatch(/at least 6 characters/i);
    });
  });

  describe('Collector Profile & Settings: PATCH /api/auth/profile & PATCH /api/auth/password', () => {
    let token;
    let userId;
    const initialEmail = 'collector_edit@example.com';
    const initialPassword = 'password123';

    beforeEach(async () => {
      const user = await User.create({
        name: 'Collector Original',
        email: initialEmail,
        password: initialPassword,
        phone: '9876543210'
      });
      userId = user._id.toString();

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: initialEmail, password: initialPassword });
      token = loginRes.body.token;
    });

    it('should update name, phone, avatarUrl, and default shippingAddress successfully', async () => {
      const payload = {
        name: 'Heritage Shilp Connoisseur',
        phone: '9123456780',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
        shippingAddress: {
          address: 'Villa 108, Civil Lines',
          city: 'Jaipur',
          state: 'Rajasthan',
          pincode: '302001'
        }
      };

      const res = await request(app)
        .patch('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Heritage Shilp Connoisseur');
      expect(res.body.data.phone).toBe('9123456780');
      expect(res.body.data.avatarUrl).toBe('https://images.unsplash.com/photo-1544005313-94ddf0286df2');
      expect(res.body.data.shippingAddress).toMatchObject({
        address: 'Villa 108, Civil Lines',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302001'
      });

      // Verify GET /api/auth/profile also reflects the persisted changes
      const getRes = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);
      expect(getRes.body.name).toBe('Heritage Shilp Connoisseur');
      expect(getRes.body.shippingAddress.city).toBe('Jaipur');
    });

    it('should reject profile update with invalid mobile phone format', async () => {
      const res = await request(app)
        .patch('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ phone: '12345' }); // Invalid: not 10 digits starting with 6-9

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/valid 10-digit/i);
    });

    it('should update password when correct currentPassword is provided', async () => {
      const res = await request(app)
        .patch('/api/auth/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: initialPassword,
          newPassword: 'BrandNewSecurePassword789'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/updated successfully/i);

      // Verify login with new password
      const newLoginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: initialEmail, password: 'BrandNewSecurePassword789' });
      expect(newLoginRes.statusCode).toBe(200);
    });

    it('should reject password change when currentPassword is incorrect', async () => {
      const res = await request(app)
        .patch('/api/auth/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'wrongPasswordXYZ',
          newPassword: 'BrandNewSecurePassword789'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/incorrect/i);
    });

    it('should allow Google SSO user to set a local password without providing currentPassword', async () => {
      // Create a Google SSO user
      const googleUser = await User.create({
        name: 'Google Collector',
        email: 'google_test_user@gmail.com',
        password: 'dummy_auto_generated_password',
        authProvider: 'google'
      });

      const jwt = require('jsonwebtoken');
      const googleToken = jwt.sign({ id: googleUser._id }, process.env.JWT_SECRET || 'parampara_secret_key_2026', { expiresIn: '1d' });

      const res = await request(app)
        .patch('/api/auth/password')
        .set('Authorization', `Bearer ${googleToken}`)
        .send({ newPassword: 'FirstLocalPassword123' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify login with newly set local password works
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'google_test_user@gmail.com', password: 'FirstLocalPassword123' });
      expect(loginRes.statusCode).toBe(200);
    });
  });

  describe('GET /api/auth/stats (Collector Population)', () => {
    it('should return total user registration count and recent user list', async () => {
      const res = await request(app).get('/api/auth/stats');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.totalRegisteredUsers).toBe('number');
      expect(Array.isArray(res.body.latestUsers)).toBe(true);
    });
  });
});

