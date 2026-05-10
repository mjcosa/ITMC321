const { getSalesData } = require('./salesService');
const { getAllInventory } = require('./inventoryService');
const Forecast = require('../models/forecast');
const PricingStrategy = require('../models/pricing');

// EXTRACT
const fetchSubsystemData = async (uploadedData) => {
  const rawInventory = uploadedData?.inventory || await getAllInventory();
  const rawSales = uploadedData?.sales || await getSalesData();
  return { rawInventory, rawSales };
};

// TRANSFORM
const cleanAndTransformData = (rawInventory, rawSales) => {
  const inventory = rawInventory.map(item => ({
    productId: item.product_id || item.productId || item.sku || 'UNKNOWN',
    productName: item.name || item.product_name || 'Unnamed Product',
    currentStock: Number(item.current_stock ?? item.currentStock ?? item.stock ?? 0) || 0,
    price: Number(item.price || item.currentPrice || item.cost || 10.00) 
  })).filter(item => item.productId !== 'UNKNOWN');

  const sales = rawSales.map(sale => {
    let rawDate = sale.date || sale.created_at || sale.timestamp || new Date();
    let parsedDate = new Date(rawDate);
    if (isNaN(parsedDate)) parsedDate = new Date();

    return {
      productId: sale.product_id || sale.productId || sale.item_id || sale.sku || 'UNKNOWN',
      quantity: Number(sale.quantity || sale.qty || sale.amount || 0) || 0,
      date: parsedDate.toISOString().split('T')[0]
    };
  }).filter(sale => sale.productId !== 'UNKNOWN' && sale.quantity > 0);

  const salesByProductAndDate = {};
  
  sales.forEach(({ productId, quantity, date }) => {
    if (!salesByProductAndDate[productId]) {
      salesByProductAndDate[productId] = { totalSales: 0, dailyData: {} };
    }
    if (!salesByProductAndDate[productId].dailyData[date]) {
      salesByProductAndDate[productId].dailyData[date] = 0;
    }
    salesByProductAndDate[productId].dailyData[date] += quantity;
    salesByProductAndDate[productId].totalSales += quantity;
  });

  return { inventory, salesByProductAndDate };
};

// LOAD / COMPUTE
const calculateForecasts = async (uploadedData = null) => {
  const { rawInventory, rawSales } = await fetchSubsystemData(uploadedData);
  const { inventory, salesByProductAndDate } = cleanAndTransformData(rawInventory, rawSales);

  const safetyStock = 20;
  const forecastResults = [];
  
  // Arrays for MongoDB batch inserts
  const forecastsToSave = []; 
  const pricingToSave = []; 

  inventory.forEach(product => {
    const salesRecord = salesByProductAndDate[product.productId] || { totalSales: 0, dailyData: {} };
    const totalSales = salesRecord.totalSales;
    
    // FORECAST MATH
    const baselineDemand = totalSales || 15; 
    const predictedDemand = Math.max(1, Math.round(baselineDemand * 1.1));
    
    let recommendation = 'Stock level adequate';
    let restockAmount = 0;
    
    if ((product.currentStock - predictedDemand) < safetyStock) {
      restockAmount = Math.max(0, predictedDemand + safetyStock - product.currentStock);
      recommendation = `Restock ${restockAmount} units`;
    }

    const stockoutRisk = restockAmount > 50 ? 'High' : (restockAmount > 0 ? 'Medium' : 'Low');

    // PRICING ENGINE MATH
    // Fallback to $10.00 if your inventory data doesn't have a price field yet
    const currentPrice = Number(product.price || product.currentPrice || 10.00); 
    let suggestedPrice = currentPrice;
    let strategyReason = 'Demand matches supply; hold current price.';
    let elasticityScore = 1.0; // Baseline

    // Rule A: Scarcity / High Demand
    if (stockoutRisk === 'High' || predictedDemand > (product.currentStock * 1.5)) {
      suggestedPrice = Number((currentPrice * 1.05).toFixed(2)); 
      strategyReason = 'High demand and low stock. Raised price by 5% to maximize margin.';
      elasticityScore = 0.8; 
    } 
    // Rule B: Overstock / Clearance
    else if (product.currentStock > (predictedDemand * 3)) {
      suggestedPrice = Number((currentPrice * 0.90).toFixed(2)); 
      strategyReason = 'Excess inventory detected. Lowered price by 10% to stimulate sales.';
      elasticityScore = 1.5; 
    }

    const graphData = Object.keys(salesRecord.dailyData)
      .sort((a, b) => new Date(a) - new Date(b))
      .map(date => ({
        date: date,
        historical_sales: salesRecord.dailyData[date]
      }));

    // PUSH TO API RESPONSE ARRAY
    forecastResults.push({
      product_id: product.productId,
      product_name: product.productName,
      current_stock: product.currentStock,
      current_price: currentPrice,
      graph_data: graphData, 
      forecast: {
        predicted_demand_next_30_days: predictedDemand,
        recommendation: recommendation,
        suggested_restock_qty: restockAmount
      },
      pricing: {
        suggested_price: suggestedPrice,
        reason: strategyReason
      },
      analytics: {
        total_historical_sales: totalSales,
        stockout_risk: stockoutRisk 
      }
    });

    // PUSH TO DATABASE ARRAYS
    forecastsToSave.push({
      productId: product.productId,
      productName: product.productName,
      predictedDemand: predictedDemand,
      suggestedRestockQty: restockAmount,
      stockoutRisk: stockoutRisk,
      modelUsed: 'Moving Average / Linear Baseline',
      graphData: graphData
    });

    // Only save a pricing strategy if a change is actually recommended
    if (suggestedPrice !== currentPrice) {
      pricingToSave.push({
        productId: product.productId,
        currentPrice: currentPrice,
        suggestedPrice: suggestedPrice,
        elasticityScore: elasticityScore,
        strategyReason: strategyReason,
        status: 'Pending Approval' 
      });
    }
  });

  // BATCH INSERT TO MONGODB
  try {
    const dbPromises = [];
    if (forecastsToSave.length > 0) dbPromises.push(Forecast.insertMany(forecastsToSave));
    if (pricingToSave.length > 0) dbPromises.push(PricingStrategy.insertMany(pricingToSave));
    
    await Promise.all(dbPromises);
    console.log(`Successfully saved ${forecastsToSave.length} forecasts and ${pricingToSave.length} pricing strategies.`);
  } catch (dbError) {
    console.error('Error batch saving to database:', dbError);
  }

  return forecastResults;
};

module.exports = {
  calculateForecasts,
};