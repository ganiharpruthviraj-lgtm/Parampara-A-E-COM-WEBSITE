const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Shipping & Logistics API Engine (India Post & Shiprocket)', () => {
  const sampleOrderPayload = {
    orderItems: [
      {
        name: 'Authentic Jaipur Blue Pottery Royal Vase',
        qty: 1,
        price: 4800,
        giNumber: 'GI/42/RAJ/POTTERY',
        artisanName: 'Gopal Saini (Shilp Guru)',
        artisanPayoutAmount: 3360,
        product: 'rj-blue-pottery-01'
      }
    ],
    shippingAddress: {
      fullName: 'Aarav Mehta',
      address: 'Heritage Heights, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'India',
      phone: '9876543210'
    },
    paymentMethod: 'Razorpay UPI',
    itemsPrice: 4800,
    shippingPrice: 0,
    taxPrice: 240,
    totalPrice: 5040
  };

  describe('POST /api/shipping/calculate-rates', () => {
    it('should calculate shipping rates and postal transit time for standard PIN code', async () => {
      const res = await request(app)
        .post('/api/shipping/calculate-rates')
        .send({
          deliveryPincode: '560038',
          pickupPincode: '302001',
          weightGrams: 850,
          craftValue: 4800
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.serviceable).toBe(true);
      expect(res.body.destination.state).toBe('Karnataka');
      expect(Array.isArray(res.body.courierOptions)).toBe(true);
      expect(res.body.courierOptions.length).toBeGreaterThanOrEqual(2);

      const standard = res.body.courierOptions.find(c => c.id === 'standard');
      expect(standard).toBeDefined();
      expect(standard.name).toMatch(/India Post Speed Post/i);
      expect(standard.rate).toBe(0); // Free for orders >= 2000

      const express = res.body.courierOptions.find(c => c.id === 'express');
      expect(express).toBeDefined();
      expect(express.rate).toBe(299);
    });

    it('should handle special remote Himalayan / Northeast postal zones', async () => {
      const res = await request(app)
        .post('/api/shipping/calculate-rates')
        .send({
          deliveryPincode: '175131', // Kullu, Himachal Pradesh
          craftValue: 3500
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.destination.zone).toMatch(/Special Remote/i);
      expect(res.body.courierOptions[0].coverage).toMatch(/100% PIN Code Reach/i);
    });

    it('should reject invalid PIN code formats', async () => {
      const res = await request(app)
        .post('/api/shipping/calculate-rates')
        .send({
          deliveryPincode: '123' // Invalid length
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/6 numeric digits/i);
    });
  });

  describe('GET /api/shipping/pincode/:pincode', () => {
    it('should resolve Indian postal details by PIN code', async () => {
      const res = await request(app).get('/api/shipping/pincode/110001');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.city).toBe('New Delhi');
      expect(res.body.data.state).toBe('Delhi');
      expect(res.body.data.zone).toBe('North');
    });

    it('should return 400 for malformed PIN code', async () => {
      const res = await request(app).get('/api/shipping/pincode/ABC');
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/shipping/create-shipment', () => {
    it('should generate official AWB code and schedule automated artisan cluster pickup', async () => {
      // 1. Create order
      const createRes = await request(app)
        .post('/api/orders')
        .send(sampleOrderPayload);

      const orderId = createRes.body.data._id;

      // 2. Book shipment
      const res = await request(app)
        .post('/api/shipping/create-shipment')
        .send({
          orderId,
          provider: 'India Post Speed Post',
          pickupDetails: {
            clusterLocation: 'Jaipur Blue Pottery Craft Guild, Rajasthan',
            artisanName: 'Gopal Saini (Shilp Guru)'
          },
          shippingAddress: sampleOrderPayload.shippingAddress,
          totalAmount: 5040
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.shipment).toHaveProperty('awb');
      expect(res.body.shipment.awb).toMatch(/^IP\d+IN$/); // India Post AWB format
      expect(res.body.shipment.pickupDetails).toHaveProperty('pickupToken');
      expect(res.body.shipment.pickupDetails.status).toBe('Scheduled');
      expect(Array.isArray(res.body.shipment.shippingTimeline)).toBe(true);
    });
  });

  describe('GET /api/shipping/track/:awb', () => {
    it('should return complete tracking timeline for an AWB or Order ID', async () => {
      // 1. Create and dispatch order
      const createRes = await request(app)
        .post('/api/orders')
        .send(sampleOrderPayload);

      const orderId = createRes.body.data._id;

      const shipRes = await request(app)
        .post(`/api/orders/${orderId}/dispatch`)
        .send({
          provider: 'India Post Speed Post',
          clusterLocation: 'Jaipur Craft Hub'
        });

      const awb = shipRes.body.shipment.awb;

      // 2. Track via public tracking endpoint
      const trackRes = await request(app).get(`/api/shipping/track/${awb}`);

      expect(trackRes.statusCode).toBe(200);
      expect(trackRes.body.success).toBe(true);
      expect(trackRes.body.data.awb).toBe(awb);
      expect(trackRes.body.data.courierPartner).toMatch(/India Post/i);
      expect(Array.isArray(trackRes.body.data.timeline)).toBe(true);
      expect(trackRes.body.data.timeline.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('POST /api/shipping/webhook', () => {
    it('should receive and process courier milestone updates', async () => {
      const webhookPayload = {
        awb: 'IP849201938IN',
        current_status: 'IN_TRANSIT',
        location: 'National Sorting Hub, Delhi NSH',
        remarks: 'Item dispatched to destination delivery center'
      };

      const res = await request(app)
        .post('/api/shipping/webhook')
        .send(webhookPayload);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.orderStage).toBe('Dispatched');
    });

    it('should mark order stage as Delivered when final delivery event is received', async () => {
      const webhookPayload = {
        awb: 'IP849201938IN',
        current_status: 'DELIVERED',
        location: 'Indiranagar Sub-Post Office',
        remarks: 'Delivered to recipient with digital signature'
      };

      const res = await request(app)
        .post('/api/shipping/webhook')
        .send(webhookPayload);

      expect(res.statusCode).toBe(200);
      expect(res.body.orderStage).toBe('Delivered');
    });
  });

  describe('Order Workflow Dispatch Integration (POST /:id/dispatch & PUT /:id/status)', () => {
    it('should automatically generate AWB and schedule pickup when order transitions to Dispatched', async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .send(sampleOrderPayload);

      const orderId = createRes.body.data._id;

      const res = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .send({
          status: 'Dispatched',
          clusterLocation: 'Kullu Shawl Weavers Hub'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.order.orderStatus).toBe('Dispatched');
      expect(res.body.order).toHaveProperty('awb');
      expect(res.body.order.awb).toMatch(/^IP\d+IN$/);
    });
  });

});

