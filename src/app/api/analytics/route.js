import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongoose';
import Purchase from '@/models/Purchase';
import Product from '@/models/Product';

// GET analytics data
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'weekly'; // daily, weekly, monthly
    const type = searchParams.get('type') || 'sales'; // sales, expiry, spending

    // Set date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'daily':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7); // Last 7 days
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30); // Last 30 days
        break;
      case 'monthly':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 6); // Last 6 months
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30); // Default to 30 days
    }

    // Different analytics based on user role and type
    let result = {};

    if (session.user.role === 'Administrator') {
      if (type === 'sales') {
        // Sales analytics for store
        const salesData = await getSalesAnalytics(session.user.id, startDate, period);
        result = { salesData };
      } else if (type === 'expiry') {
        // Expiry analytics for store
        const expiryData = await getExpiryAnalytics(session.user.id);
        result = { expiryData };
      } else if (type === 'predictive') {
        // Predictive analytics (this would connect to an AI service in production)
        const predictiveData = await getPredictiveAnalytics(session.user.id, startDate);
        result = { predictiveData };
      }
    } else if (session.user.role === 'Customer') {
      if (type === 'spending') {
        // Spending analytics for customer
        const spendingData = await getSpendingAnalytics(session.user.id, startDate, period);
        result = { spendingData };
      } else if (type === 'expiry') {
        // Expiry notifications for customer's purchases
        const expiryNotifications = await getCustomerExpiryNotifications(session.user.id);
        result = { expiryNotifications };
      }
    }

    return NextResponse.json(
      { success: true, ...result },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// Helper function to get sales analytics
async function getSalesAnalytics(storeId, startDate, period) {
  const purchases = await Purchase.find({
    storeId,
    purchaseDate: { $gte: startDate }
  });

  // Group by product and calculate total sales
  const productSales = {};
  purchases.forEach(purchase => {
    purchase.items.forEach(item => {
      const productId = item.productId.toString();
      if (!productSales[productId]) {
        productSales[productId] = {
          productName: item.productName,
          totalQuantity: 0,
          totalRevenue: 0
        };
      }
      productSales[productId].totalQuantity += item.quantity;
      productSales[productId].totalRevenue += item.price * item.quantity;
    });
  });

  // Convert to array and sort by total quantity
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 10);

  // Group by date for trend analysis
  const salesByDate = {};
  purchases.forEach(purchase => {
    let dateKey;
    const date = new Date(purchase.purchaseDate);
    
    if (period === 'daily') {
      dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (period === 'weekly') {
      // Get the week number
      const weekNumber = getWeekNumber(date);
      dateKey = `${date.getFullYear()}-W${weekNumber}`;
    } else if (period === 'monthly') {
      dateKey = `${date.getFullYear()}-${date.getMonth() + 1}`; // YYYY-MM
    }
    
    if (!salesByDate[dateKey]) {
      salesByDate[dateKey] = {
        totalSales: 0,
        itemCount: 0
      };
    }
    
    salesByDate[dateKey].totalSales += purchase.totalAmount;
    purchase.items.forEach(item => {
      salesByDate[dateKey].itemCount += item.quantity;
    });
  });

  // Convert to array for charting
  const salesTrend = Object.entries(salesByDate).map(([date, data]) => ({
    date,
    totalSales: data.totalSales,
    itemCount: data.itemCount
  })).sort((a, b) => a.date.localeCompare(b.date));

  return {
    topProducts,
    salesTrend,
    totalRevenue: purchases.reduce((sum, p) => sum + p.totalAmount, 0),
    totalOrders: purchases.length
  };
}

// Helper function to get week number
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Helper function to get expiry analytics
async function getExpiryAnalytics(storeId) {
  const now = new Date();
  
  // Get products expiring in the next 30 days
  const thirtyDaysFromNow = new Date(now);
  thirtyDaysFromNow.setDate(now.getDate() + 30);
  
  const expiringProducts = await Product.find({
    storeId,
    expiryDate: { $gte: now, $lte: thirtyDaysFromNow },
    isActive: true
  }).sort({ expiryDate: 1 });

  // Group by expiry timeframe
  const expiryGroups = {
    thisWeek: [],
    nextWeek: [],
    thisMonth: []
  };

  const oneWeekFromNow = new Date(now);
  oneWeekFromNow.setDate(now.getDate() + 7);
  
  const twoWeeksFromNow = new Date(now);
  twoWeeksFromNow.setDate(now.getDate() + 14);

  expiringProducts.forEach(product => {
    const expiryDate = new Date(product.expiryDate);
    
    if (expiryDate <= oneWeekFromNow) {
      expiryGroups.thisWeek.push(product);
    } else if (expiryDate <= twoWeeksFromNow) {
      expiryGroups.nextWeek.push(product);
    } else {
      expiryGroups.thisMonth.push(product);
    }
  });

  return {
    expiryGroups,
    totalExpiringSoon: expiringProducts.length
  };
}

// Helper function for predictive analytics (simplified)
async function getPredictiveAnalytics(storeId, startDate) {
  // In a real implementation, this would call an AI service
  // For now, we'll simulate with historical data analysis
  
  const purchases = await Purchase.find({
    storeId,
    purchaseDate: { $gte: startDate }
  });

  // Calculate product popularity
  const productPopularity = {};
  purchases.forEach(purchase => {
    purchase.items.forEach(item => {
      const productId = item.productId.toString();
      if (!productPopularity[productId]) {
        productPopularity[productId] = {
          productName: item.productName,
          totalQuantity: 0,
          purchaseFrequency: 0
        };
      }
      productPopularity[productId].totalQuantity += item.quantity;
      productPopularity[productId].purchaseFrequency += 1;
    });
  });

  // Convert to array and calculate predicted demand
  const predictedDemand = Object.entries(productPopularity).map(([productId, data]) => {
    // Simple prediction based on past sales
    // In a real AI system, this would be much more sophisticated
    const averageDailyDemand = data.totalQuantity / 30; // Assuming 30 days of data
    
    return {
      productId,
      productName: data.productName,
      currentPopularity: data.totalQuantity,
      predictedDailyDemand: averageDailyDemand,
      predictedWeeklyDemand: averageDailyDemand * 7,
      predictedMonthlyDemand: averageDailyDemand * 30,
      confidence: 'medium' // In a real AI system, this would be calculated
    };
  }).sort((a, b) => b.currentPopularity - a.currentPopularity);

  return {
    predictedDemand: predictedDemand.slice(0, 10), // Top 10 products
    recommendedActions: [
      'Increase stock of top 3 products',
      'Consider promotions for less popular items',
      'Monitor expiry dates closely for slow-moving products'
    ]
  };
}

// Helper function for customer spending analytics
async function getSpendingAnalytics(customerId, startDate, period) {
  const purchases = await Purchase.find({
    customerId,
    purchaseDate: { $gte: startDate }
  }).populate('storeId', 'shopName');

  // Group by store
  const spendingByStore = {};
  purchases.forEach(purchase => {
    const storeId = purchase.storeId._id.toString();
    const storeName = purchase.storeId.shopName;
    
    if (!spendingByStore[storeId]) {
      spendingByStore[storeId] = {
        storeName,
        totalSpent: 0,
        visitCount: 0
      };
    }
    
    spendingByStore[storeId].totalSpent += purchase.totalAmount;
    spendingByStore[storeId].visitCount += 1;
  });

  // Group by date for trend analysis
  const spendingByDate = {};
  purchases.forEach(purchase => {
    let dateKey;
    const date = new Date(purchase.purchaseDate);
    
    if (period === 'daily') {
      dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (period === 'weekly') {
      const weekNumber = getWeekNumber(date);
      dateKey = `${date.getFullYear()}-W${weekNumber}`;
    } else if (period === 'monthly') {
      dateKey = `${date.getFullYear()}-${date.getMonth() + 1}`; // YYYY-MM
    }
    
    if (!spendingByDate[dateKey]) {
      spendingByDate[dateKey] = {
        totalSpent: 0,
        itemCount: 0
      };
    }
    
    spendingByDate[dateKey].totalSpent += purchase.totalAmount;
    purchase.items.forEach(item => {
      spendingByDate[dateKey].itemCount += item.quantity;
    });
  });

  // Convert to array for charting
  const spendingTrend = Object.entries(spendingByDate).map(([date, data]) => ({
    date,
    totalSpent: data.totalSpent,
    itemCount: data.itemCount
  })).sort((a, b) => a.date.localeCompare(b.date));

  return {
    spendingByStore: Object.values(spendingByStore),
    spendingTrend,
    totalSpent: purchases.reduce((sum, p) => sum + p.totalAmount, 0),
    totalVisits: purchases.length
  };
}

// Helper function for customer expiry notifications
async function getCustomerExpiryNotifications(customerId) {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now);
  thirtyDaysFromNow.setDate(now.getDate() + 30);
  
  // Find recent purchases (last 90 days)
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(now.getDate() - 90);
  
  const purchases = await Purchase.find({
    customerId,
    purchaseDate: { $gte: ninetyDaysAgo }
  });

  // Extract items with upcoming expiry
  const expiringItems = [];
  purchases.forEach(purchase => {
    purchase.items.forEach(item => {
      const expiryDate = new Date(item.expiryDate);
      if (expiryDate >= now && expiryDate <= thirtyDaysFromNow) {
        expiringItems.push({
          productName: item.productName,
          expiryDate: item.expiryDate,
          purchaseDate: purchase.purchaseDate,
          daysUntilExpiry: Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)),
          storeName: purchase.storeId.shopName
        });
      }
    });
  });

  // Sort by days until expiry
  expiringItems.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

  return {
    expiringItems,
    totalExpiringItems: expiringItems.length
  };
}
