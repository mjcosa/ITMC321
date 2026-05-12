process.env.INVENTORY_API_KEY = 'test-secret-123';

require('./setup');
const request = require('supertest');
const express = require('express');
const pricingRoutes = require('../routes/pricingRoutes');
// Create a mini-app just for testing the routes
const app = express();
app.use(express.json());
app.use('/api/pricing', pricingRoutes);

// Set the fake secret for the test environment


describe('M2M API Key Security', () => {
  it('should REJECT requests without an API key', async () => {
    const response = await request(app).get('/api/pricing/recommendations');
    
    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/missing API Key/i);
  });

  it('should REJECT requests with the WRONG API key', async () => {
    const response = await request(app)
      .get('/api/pricing/recommendations')
      .set('x-api-key', 'hacker-guessed-wrong');
    
    expect(response.status).toBe(401);
  });

  it('should ALLOW requests with the CORRECT API key', async () => {
    const response = await request(app)
      .get('/api/pricing/recommendations')
      .set('x-api-key', 'test-secret-123'); // Matches the env variable!
    console.log("Who rejected me?", response.body.message);
    // 200 means OK! (It might return empty data, but it let us through)
    expect(response.status).toBe(200); 
  });
});