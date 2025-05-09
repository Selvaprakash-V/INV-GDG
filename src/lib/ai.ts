import * as tf from '@tensorflow/tfjs-node';
import { prisma } from './prisma';
import * as stats from 'simple-statistics';

interface PredictionResult {
  predictedSales: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  recommendations: string[];
  riskAssessment: string;
}

export async function predictProductSales(productId: string, period: 'DAILY' | 'WEEKLY' | 'MONTHLY'): Promise<PredictionResult> {
  // Get historical purchase data
  const purchases = await prisma.purchase.findMany({
    where: {
      productId,
    },
    orderBy: {
      purchaseDate: 'desc',
    },
    take: 90, // Last 90 purchases for better analysis
  });

  if (purchases.length < 10) {
    return {
      predictedSales: 0,
      trend: 'stable',
      confidence: 0,
      recommendations: ['Insufficient data for prediction'],
      riskAssessment: 'Not enough historical data'
    };
  }

  // Prepare data for analysis
  const quantities = purchases.map(p => p.quantity);
  const dates = purchases.map(p => p.purchaseDate.getTime());
  
  // Calculate basic statistics
  const mean = stats.mean(quantities);
  const std = stats.standardDeviation(quantities);
  
  // Calculate trend using linear regression
  const regression = stats.linearRegression(
    dates.map((date, i) => [date, quantities[i]])
  );

  // Determine trend
  const trend = regression.m > 0.1 ? 'increasing' : 
                regression.m < -0.1 ? 'decreasing' : 'stable';

  // Create and train a simple TensorFlow model
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
  model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });

  // Prepare training data
  const xs = tf.tensor2d(dates.map(d => [d]), [dates.length, 1]);
  const ys = tf.tensor2d(quantities.map(q => [q]), [quantities.length, 1]);

  // Train the model
  await model.fit(xs, ys, {
    epochs: 100,
    verbose: 0
  });

  // Make prediction for next period
  const lastDate = Math.max(...dates);
  const nextDate = lastDate + (period === 'DAILY' ? 86400000 : 
                              period === 'WEEKLY' ? 604800000 : 2592000000);
  
  const prediction = model.predict(tf.tensor2d([[nextDate]], [1, 1])) as tf.Tensor;
  const predictedSales = Math.round(prediction.dataSync()[0]);

  // Calculate confidence based on R-squared value
  const confidence = Math.min(100, Math.max(0, 
    (1 - (std / mean)) * 100
  ));

  // Generate recommendations
  const recommendations = [];
  if (trend === 'increasing') {
    recommendations.push('Consider increasing stock levels');
  } else if (trend === 'decreasing') {
    recommendations.push('Consider reducing stock levels');
  }
  
  if (std > mean * 0.5) {
    recommendations.push('High variability in sales - maintain flexible stock levels');
  }

  // Risk assessment
  const riskAssessment = confidence > 70 ? 'Low risk' :
                        confidence > 40 ? 'Medium risk' : 'High risk';

  // Store the prediction in the database
  await prisma.analytics.create({
    data: {
      productId,
      prediction: {
        predictedSales,
        trend,
        confidence,
        recommendations,
        riskAssessment
      },
      period,
    },
  });

  return {
    predictedSales,
    trend,
    confidence,
    recommendations,
    riskAssessment
  };
}

export async function checkExpiryAlerts() {
  const products = await prisma.product.findMany({
    where: {
      expiryDate: {
        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Products expiring in next 7 days
      },
    },
    include: {
      supermarket: true,
    },
  });

  return products.map(product => ({
    productId: product.id,
    productName: product.name,
    expiryDate: product.expiryDate,
    supermarketName: product.supermarket.name,
    daysUntilExpiry: Math.ceil((product.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  }));
} 