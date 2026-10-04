const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const Product = require('../models/Product');

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('Products API', () => {
  let sampleProduct1, sampleProduct2;

  beforeEach(async () => {
    sampleProduct1 = await Product.create({
      name: 'Jaipur Blue Pottery Vase',
      state: 'Rajasthan',
      craft: 'Blue Pottery',
      category: 'Pottery',
      price: 4500,
      description: 'Authentic cobalt blue quartz vase from Jaipur.',
      imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa',
    });

    sampleProduct2 = await Product.create({
      name: 'Kashmiri Pashmina Shawl',
      state: 'Jammu & Kashmir',
      craft: 'Pashmina Weaving',
      category: 'Textiles',
      price: 18500,
      description: 'Handwoven pure Pashmina shawl with fine needlework.',
      imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675',
    });
  });

  describe('GET /api/products', () => {
    it('should return a list of all products', async () => {
      const res = await request(app).get('/api/products');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('count', 2);
      expect(res.body.products).toHaveLength(2);
    });

    it('should filter products by state', async () => {
      const res = await request(app).get('/api/products?state=Rajasthan');

      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.products[0].name).toBe('Jaipur Blue Pottery Vase');
    });

    it('should filter products by price range', async () => {
      const res = await request(app).get('/api/products?minPrice=10000&maxPrice=20000');

      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.products[0].name).toBe('Kashmiri Pashmina Shawl');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return single product by ID', async () => {
      const res = await request(app).get(`/api/products/${sampleProduct1._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Jaipur Blue Pottery Vase');
      expect(res.body.state).toBe('Rajasthan');
    });

    it('should return 404 for non-existent product ID', async () => {
      const mockId = '60d5ec49f1b2c8112c8b9999';
      const res = await request(app).get(`/api/products/${mockId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });
  });
});
