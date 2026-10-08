const request = require('supertest');
const app = require('../app');

describe('GI Registry API Endpoints', () => {
  it('GET /api/gi should return the GI registry catalog', async () => {
    const res = await request(app).get('/api/gi');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/gi?state=Rajasthan should filter by state', async () => {
    const res = await request(app).get('/api/gi?state=Rajasthan');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach(item => {
      expect(item.state.toLowerCase()).toContain('rajasthan');
    });
  });

  it('GET /api/gi?q=pottery should perform text search', async () => {
    const res = await request(app).get('/api/gi?q=pottery');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    const hasPottery = res.body.data.some(i => 
      i.name.toLowerCase().includes('pottery') || 
      i.craft.toLowerCase().includes('pottery') ||
      i.subCategory.toLowerCase().includes('pottery')
    );
    expect(hasPottery).toBe(true);
  });

  it('GET /api/gi/:id should return single GI craft record', async () => {
    const res = await request(app).get('/api/gi/GI-001');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('id', 'GI-001');
    expect(res.body.data).toHaveProperty('giNumber');
  });

  it('GET /api/gi/stats should return aggregate statistics', async () => {
    const res = await request(app).get('/api/gi/stats');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('stats');
    expect(res.body.stats).toHaveProperty('total');
    expect(res.body.stats).toHaveProperty('totalArtisans');
    expect(res.body.stats).toHaveProperty('categoryCounts');
  });

  it('GET /api/gi/filters should return available states and categories', async () => {
    const res = await request(app).get('/api/gi/filters');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('filters');
    expect(res.body.filters).toHaveProperty('states');
    expect(res.body.filters).toHaveProperty('subCategories');
    expect(Array.isArray(res.body.filters.states)).toBe(true);
    expect(res.body.filters.states).toContain('Rajasthan');
  });
});
