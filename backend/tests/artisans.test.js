const request = require('supertest');
const app = require('../app');

describe('Artisans API (/api/artisans)', () => {
  test('GET /api/artisans returns all master artisans across India', async () => {
    const res = await request(app).get('/api/artisans');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(50);
  });

  test('GET /api/artisans/stats returns correct national metrics', async () => {
    const res = await request(app).get('/api/artisans/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.statesCovered).toBeGreaterThanOrEqual(28);
    expect(res.body.giVerifiedPercent).toBe(100);
  });

  test('GET /api/artisans with state filter returns state artisans', async () => {
    const res = await request(app).get('/api/artisans?state=Karnataka');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach(a => {
      expect(a.state.toLowerCase()).toBe('karnataka');
    });
  });

  test('GET /api/artisans with region filter returns regional artisans', async () => {
    const res = await request(app).get('/api/artisans?region=North+East');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach(a => {
      expect(a.region.toLowerCase()).toBe('north east');
    });
  });

  test('GET /api/artisans with search query returns matching results', async () => {
    const res = await request(app).get('/api/artisans?q=Gopal+Saini');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].name).toContain('Gopal Saini');
  });

  test('GET /api/artisans/:id returns individual artisan dossier', async () => {
    const res = await request(app).get('/api/artisans/artisan-rj-gopal-saini');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('artisan-rj-gopal-saini');
    expect(res.body.data.craft).toContain('Blue Pottery');
  });

  test('GET /api/artisans/:id with non-existent id returns 404', async () => {
    const res = await request(app).get('/api/artisans/non-existent-id-xyz');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
