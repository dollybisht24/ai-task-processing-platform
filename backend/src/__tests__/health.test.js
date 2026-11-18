const request = require('supertest');
const app = require('../app');
require('./setup');

describe('Health & Readiness Probes', () => {
  it('GET /api/health should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });

  it('GET /api/ready should return 200 when MongoDB and Redis are connected', async () => {
    const res = await request(app).get('/api/ready');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.mongodb).toBe('connected');
    expect(res.body.data.redis).toBe('connected');
  });
});
