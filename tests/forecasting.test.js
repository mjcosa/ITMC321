require('./setup'); // Bring in the fake database
const { calculateForecasts } = require('../services/forecastingService');

describe('Forecasting Engine: cleanAndTransformData', () => {
  it('should correctly group sales into daily, weekly, and monthly buckets', async () => {
    // 1. Mock Data: What Render sends us
    const mockData = {
      inventory: [{ productId: 'P123', name: 'iPhone', currentStock: 50, price: 1000 }],
      sales: [
        {
          order_id: 'ORD-1',
          payment_status: 'Confirmed', // Should be counted
          createdAt: '2026-05-13T10:00:00.000Z', // Wednesday
          items: [{ product_id: 'P123', quantity: 2 }]
        },
        {
          order_id: 'ORD-2',
          payment_status: 'Confirmed', // Should be counted
          createdAt: '2026-05-14T10:00:00.000Z', // Thursday
          items: [{ product_id: 'P123', quantity: 3 }]
        },
        {
          order_id: 'ORD-3',
          payment_status: 'Failed', // MUST BE IGNORED
          createdAt: '2026-05-14T10:00:00.000Z', 
          items: [{ product_id: 'P123', quantity: 100 }]
        }
      ]
    };

    // 2. Run the math
    const result = await calculateForecasts(mockData);
    
    // 3. Assertions (The Test)
    const iphoneData = result[0];
    
    // The Wednesday + Thursday sales should equal 5
    expect(iphoneData.analytics.total_historical_sales).toBe(5);
    
    // The Failed 100 quantity should NOT be there
    expect(iphoneData.analytics.total_historical_sales).not.toBe(105);

    // The Weekly bucket should group Wed & Thurs under Monday the 11th
    expect(iphoneData.sales_history.weekly['2026-05-11']).toBe(5);
  });
});