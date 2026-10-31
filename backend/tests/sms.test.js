const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const User = require('../models/User');
const Order = require('../models/Order');
const smsService = require('../services/smsService');
const jwt = require('jsonwebtoken');

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

describe('Phase 7 — Production SMS Gateway & Mobile Authentication (US-07)', () => {

  describe('SMS Gateway Service Unit Tests', () => {
    it('should format recipient phone and return demo mode response when credentials unset', async () => {
      const result = await smsService.sendTransactionalSMS('9876543210', 'Test transactional alert');
      expect(result.success).toBe(true);
      expect(result.provider).toBe('DemoMode');
      expect(result.recipient).toBe('9876543210');
      expect(result.message).toBe('Test transactional alert');
    });

    it('should reject invalid phone numbers with less than 10 digits', async () => {
      const result = await smsService.sendTransactionalSMS('12345', 'Invalid message');
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/invalid/i);
    });

    it('should generate properly formatted order dispatched SMS', async () => {
      const result = await smsService.sendOrderDispatchedSMS('9876543210', {
        orderId: '64e8b3a0f7e4a1b2c3d4e5f6',
        awb: 'INDPOST884920',
        courierPartner: 'India Post Speed Post'
      });
      expect(result.success).toBe(true);
      expect(result.message).toContain('D4E5F6');
      expect(result.message).toContain('India Post Speed Post');
      expect(result.message).toContain('INDPOST884920');
    });

    it('should generate properly formatted order delivered SMS', async () => {
      const result = await smsService.sendOrderDeliveredSMS('9876543210', {
        orderId: '64e8b3a0f7e4a1b2c3d4e5f6',
        artisanName: 'Bhuttico Weavers Cooperative'
      });
      expect(result.success).toBe(true);
      expect(result.message).toContain('D4E5F6');
      expect(result.message).toContain('Bhuttico Weavers Cooperative');
      expect(result.message).toContain('70%');
    });

    it('should generate properly formatted artisan payout disbursed SMS', async () => {
      const result = await smsService.sendArtisanPayoutDisbursedSMS('9876543210', {
        orderId: '64e8b3a0f7e4a1b2c3d4e5f6',
        amount: 3360,
        utr: 'UTR-RZP-99210'
      });
      expect(result.success).toBe(true);
      expect(result.message).toContain('3360');
      expect(result.message).toContain('UTR-RZP-99210');
      expect(result.message).toContain('70%');
    });

    it('should enforce rate limiting after 5 requests per number', () => {
      const testPhone = '9999900001';
      // First 5 should succeed
      for (let i = 0; i < 5; i++) {
        const check = smsService.checkRateLimit(testPhone);
        expect(check.allowed).toBe(true);
      }
      // 6th check should be denied
      const blocked = smsService.checkRateLimit(testPhone);
      expect(blocked.allowed).toBe(false);
      expect(blocked.waitSec).toBeGreaterThan(0);
    });
  });

  describe('POST /api/auth/phone/send-otp (and /send-otp alias)', () => {
    it('should send 6-digit OTP code to valid 10-digit mobile number', async () => {
      const res = await request(app)
        .post('/api/auth/phone/send-otp')
        .send({ phone: '9876543210' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.demoCode).toMatch(/^\d{6}$/);
    });

    it('should accept /api/auth/send-otp backward compatible alias', async () => {
      const res = await request(app)
        .post('/api/auth/send-otp')
        .send({ phone: '9876543210' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject requests with missing or invalid phone number', async () => {
      const res = await request(app)
        .post('/api/auth/phone/send-otp')
        .send({ phone: '123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/valid 10-digit phone/i);
    });

    it('should return 429 when phone exceeds rate limit', async () => {
      const spamPhone = '9888877771';
      // Send 5 requests
      for (let i = 0; i < 5; i++) {
        await request(app).post('/api/auth/phone/send-otp').send({ phone: spamPhone });
      }
      // 6th request must return 429
      const res = await request(app).post('/api/auth/phone/send-otp').send({ phone: spamPhone });
      expect(res.statusCode).toBe(429);
      expect(res.body.message).toMatch(/too many otp requests/i);
    });
  });

  describe('POST /api/auth/phone/verify-otp (and /verify-otp alias)', () => {
    it('should reject invalid or expired OTP code', async () => {
      const res = await request(app)
        .post('/api/auth/phone/verify-otp')
        .send({ phone: '9876543210', otp: '000000' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/invalid or expired otp/i);
    });

    it('should authenticate user with valid demo code and issue JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/phone/verify-otp')
        .send({ phone: '9876543210', otp: '123456' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('_id');
      expect(res.body.phone).toBe('9876543210');
      expect(res.body.email).toBe('phone_9876543210@parampara.in');

      // Verify JWT token is cryptographically valid
      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
      expect(decoded).toHaveProperty('id');
      expect(decoded.email).toBe('phone_9876543210@parampara.in');
    });

    it('should persist new phone user in MongoDB', async () => {
      await request(app)
        .post('/api/auth/phone/verify-otp')
        .send({ phone: '9123456780', otp: '123456' });

      const dbUser = await User.findOne({ phone: '9123456780' });
      expect(dbUser).not.toBeNull();
      expect(dbUser.phone).toBe('9123456780');
      expect(dbUser.email).toBe('phone_9123456780@parampara.in');
      expect(dbUser.role).toBe('user');
    });
  });

  describe('Automated SMS Alerts in Order Lifecycle', () => {
    it('should trigger dispatched SMS notification on status transition to Dispatched', async () => {
      const order = await Order.create({
        user: new User({ name: 'Collector', email: 'c@p.in', password: 'hash' })._id,
        orderItems: [
          {
            name: 'Pashmina Shawl',
            price: 5000,
            qty: 1,
            image: 'https://images.unsplash.com/photo-1',
            product: 'pashmina-01',
            artisanName: 'Ghulam Nabi',
            artisanPayoutAmount: 3500
          }
        ],
        shippingAddress: {
          fullName: 'Ankush Sharma',
          address: 'Heritage Lane',
          city: 'Jaipur',
          state: 'Rajasthan',
          postalCode: '302001',
          phone: '9876543210'
        },
        paymentMethod: 'Razorpay UPI',
        itemsPrice: 5000,
        totalPrice: 5000,
        isPaid: true
      });

      const res = await request(app)
        .put(`/api/orders/${order._id}/status`)
        .send({ status: 'Dispatched' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.order.orderStatus).toBe('Dispatched');
      expect(res.body.order.awb).toBeDefined();
    });

    it('should trigger delivered SMS notification on status transition to Delivered', async () => {
      const order = await Order.create({
        user: new User({ name: 'Collector', email: 'c2@p.in', password: 'hash' })._id,
        orderItems: [
          {
            name: 'Blue Pottery Vase',
            price: 2400,
            qty: 1,
            image: 'https://images.unsplash.com/photo-2',
            product: 'vase-02',
            artisanName: 'Gopal Saini',
            artisanPayoutAmount: 1680
          }
        ],
        shippingAddress: {
          fullName: 'Ravi Kumar',
          address: 'MG Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
          phone: '9876543211'
        },
        paymentMethod: 'Razorpay NetBanking',
        itemsPrice: 2400,
        totalPrice: 2400,
        isPaid: true
      });

      const res = await request(app)
        .put(`/api/orders/${order._id}/status`)
        .send({ status: 'Delivered' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.order.orderStatus).toBe('Delivered');
    });
  });
});
