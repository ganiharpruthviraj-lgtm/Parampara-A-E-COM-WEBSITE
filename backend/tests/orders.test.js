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

describe('Orders & Razorpay Payment Gateway API', () => {

  const sampleOrderPayload = {
    orderItems: [
      {
        name: 'Authentic Kullu Handwoven Woolen Shawl',
        qty: 1,
        image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f',
        price: 4800,
        giNumber: 'GI/RS/130/2004',
        artisanName: 'Bhuttico Handloom Weavers Cooperative',
        product: 'hp-kullu-shawl-01'
      }
    ],
    shippingAddress: {
      fullName: 'Pruthviraj Sharma',
      address: '12 Heritage Street',
      city: 'Jaipur',
      state: 'Rajasthan',
      postalCode: '302001',
      country: 'India',
      phone: '9876543210'
    },
    paymentMethod: 'Razorpay UPI',
    itemsPrice: 4800,
    shippingPrice: 0,
    taxPrice: 240,
    totalPrice: 5040
  };

  describe('POST /api/orders', () => {
    it('should successfully create an order and calculate 70% artisan payout allocation', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send(sampleOrderPayload);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.artisanSupportContribution).toBe(3360); // 70% of 4800
      expect(res.body.data.orderStatus).toBe('Processing');
    });

    it('should return 400 when required shipping details are missing', async () => {
      const invalidPayload = {
        orderItems: sampleOrderPayload.orderItems,
        shippingAddress: { fullName: 'Test' } // Missing required fields
      };

      const res = await request(app)
        .post('/api/orders')
        .send(invalidPayload);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /api/orders/create-razorpay-order', () => {
    it('should generate a valid Razorpay gateway order payload in INR', async () => {
      const res = await request(app)
        .post('/api/orders/create-razorpay-order')
        .send({ amount: 5040, currency: 'INR' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('orderId');
      expect(res.body.amount).toBe(504000); // 5040 * 100 paise
      expect(res.body.currency).toBe('INR');
    });

    it('should return 400 for invalid or missing amount', async () => {
      const res = await request(app)
        .post('/api/orders/create-razorpay-order')
        .send({ amount: 0 });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/orders/verify-payment', () => {
    it('should verify payment and mark order status as paid and handcrafted', async () => {
      // 1. Create order
      const createRes = await request(app)
        .post('/api/orders')
        .send(sampleOrderPayload);

      const orderId = createRes.body.data._id;

      // 2. Verify payment
      const res = await request(app)
        .post('/api/orders/verify-payment')
        .send({
          orderId,
          razorpayOrderId: 'order_rzp_demo_123',
          razorpayPaymentId: 'pay_demo_987654321',
          paymentMethod: 'Razorpay UPI'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data.isPaid).toBe(true);
      expect(res.body.data.orderStatus).toBe('Handcrafted');
    });
  });

  describe('GET /api/orders/:id/invoice-pdf', () => {
    it('should stream downloadable PDF invoice with GI Authenticity Certificate', async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .send(sampleOrderPayload);

      const orderId = createRes.body.data._id;

      const res = await request(app)
        .get(`/api/orders/${orderId}/invoice-pdf`)
        .responseType('blob');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toMatch(/attachment; filename="Parampara_GI_Certificate_/);
      
      // Check PDF header signature magic bytes (%PDF)
      const buffer = res.body;
      const pdfHeader = buffer.toString('utf8', 0, 4);
      expect(pdfHeader).toBe('%PDF');
    });
  });

});
