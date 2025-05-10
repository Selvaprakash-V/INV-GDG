'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Brain, TrendingUp, ShoppingCart, AlertTriangle, ArrowRight, RefreshCw, Lightbulb, BarChart2, Package } from 'lucide-react';

// Sample data for demonstration
const samplePredictiveData = {
  topSellingProducts: [
    { id: 1, name: 'Milk', category: 'Dairy', currentSales: 120, predictedSales: 135, confidence: 0.85 },
    { id: 2, name: 'Bread', category: 'Bakery', currentSales: 95, predictedSales: 105, confidence: 0.82 },
    { id: 3, name: 'Eggs', category: 'Dairy', currentSales: 80, predictedSales: 90, confidence: 0.78 },
    { id: 4, name: 'Chicken', category: 'Meat', currentSales: 65, predictedSales: 80, confidence: 0.75 },
    { id: 5, name: 'Rice', category: 'Grains', currentSales: 60, predictedSales: 65, confidence: 0.72 },
  ],
  salesTrend: [
    { month: 'Jan', actual: 12500, predicted: 12800 },
    { month: 'Feb', actual: 13200, predicted: 13500 },
    { month: 'Mar', actual: 14100, predicted: 14300 },
    { month: 'Apr', actual: 13800, predicted: 14000 },
    { month: 'May', actual: 15200, predicted: 15500 },
    { month: 'Jun', actual: null, predicted: 16200 },
    { month: 'Jul', actual: null, predicted: 16800 },
  ],
  categoryPerformance: [
    { name: 'Dairy', actual: 28, predicted: 32 },
    { name: 'Bakery', actual: 22, predicted: 25 },
    { name: 'Meat', actual: 18, predicted: 20 },
    { name: 'Produce', actual: 15, predicted: 18 },
    { name: 'Beverages', actual: 12, predicted: 14 },
    { name: 'Snacks', actual: 10, predicted: 12 },
  ],
  recommendations: [
    { id: 1, type: 'stock', message: 'Increase Milk stock by 15% for next month', priority: 'high' },
    { id: 2, type: 'promotion', message: 'Consider running a promotion on Chicken to boost sales', priority: 'medium' },
    { id: 3, type: 'stock', message: 'Reduce Rice inventory by 10% to optimize storage', priority: 'medium' },
    { id: 4, type: 'category', message: 'Dairy products are trending up, consider expanding variety', priority: 'high' },
    { id: 5, type: 'expiry', message: 'Monitor Bread closely as sales are slower than expected', priority: 'low' },
  ],
  expiryRisk: [
    { id: 1, name: 'Yogurt', category: 'Dairy', stock: 45, salesVelocity: 'slow', riskScore: 75 },
    { id: 2, name: 'Fresh Juice', category: 'Beverages', stock: 30, salesVelocity: 'medium', riskScore: 65 },
    { id: 3, name: 'Lettuce', category: 'Produce', stock: 25, salesVelocity: 'slow', riskScore: 85 },
    { id: 4, name: 'Sliced Bread', category: 'Bakery', stock: 20, salesVelocity: 'medium', riskScore: 60 },
  ]
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F'];

// Recommendation Card Component
function RecommendationCard({ recommendation }) {
  const getBgColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getIconByType = (type) => {
    switch (type) {
      case 'stock':
        return <Package className="h-5 w-5 text-purple-600" />;
      case 'promotion':
        return <ShoppingCart className="h-5 w-5 text-blue-600" />;
      case 'expiry':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'category':
        return <BarChart2 className="h-5 w-5 text-green-600" />;
      default:
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getBgColor(recommendation.priority)}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          {getIconByType(recommendation.type)}
          <Badge
            variant={
              recommendation.priority === 'high'
                ? 'destructive'
                : recommendation.priority === 'medium'
                ? 'warning'
                : 'default'
            }
            className="capitalize"
          >
            {recommendation.priority} priority
          </Badge>
          <Badge variant="outline" className="capitalize">
            {recommendation.type}
          </Badge>
        </div>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Menu</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </Button>
      </div>
      <p className="mt-3 text-gray-800">{recommendation.message}</p>
      <div className="mt-4 flex justify-end gap-2">
        <Button size="sm" variant="outline">Dismiss</Button>
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Implement</Button>
      </div>
    </div>
  );
}

export default function PredictiveAnalysis() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [predictiveData, setPredictiveData] = useState(samplePredictiveData);

  // Simulate refreshing the AI predictions
  const refreshPredictions = () => {
    setIsLoading(true);
    // In a real app, this would be an API call to your AI service
    setTimeout(() => {
      setIsLoading(false);
      // For demo purposes, we're just using the same data
      setPredictiveData({...samplePredictiveData});
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <Brain className="mr-3 h-8 w-8 text-purple-600" />
            AI Predictive Analysis
          </h2>
          <p className="text-gray-600 mt-1">
            Smart insights and predictions to optimize your inventory and sales
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={refreshPredictions}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales Forecast</TabsTrigger>
          <TabsTrigger value="expiry">Expiry Risk</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <TrendingUp className="mr-2 h-5 w-5 text-purple-600" />
                  Sales Forecast
                </CardTitle>
                <CardDescription>
                  Predicted sales trends for the next {timeframe === 'weekly' ? 'weeks' : timeframe === 'monthly' ? 'months' : 'quarters'}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={predictiveData.salesTrend}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#8884d8"
                      name="Actual Sales"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#82ca9d"
                      name="Predicted Sales"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  onClick={() => setActiveTab('sales')}
                >
                  View detailed forecast
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                  Expiry Risk Analysis
                </CardTitle>
                <CardDescription>
                  Products at risk of expiring based on current sales velocity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictiveData.expiryRisk.slice(0, 3).map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.category} • {product.stock} in stock</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge
                          variant={product.riskScore > 70 ? "destructive" : product.riskScore > 50 ? "warning" : "outline"}
                        >
                          {product.riskScore}% risk
                        </Badge>
                        <span className="text-sm text-gray-500 mt-1">
                          {product.salesVelocity} sales velocity
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  className="text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                  onClick={() => setActiveTab('expiry')}
                >
                  View all at-risk products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
                AI Recommendations
              </CardTitle>
              <CardDescription>
                Smart suggestions to optimize your inventory and boost sales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predictiveData.recommendations.slice(0, 4).map((rec) => (
                  <div
                    key={rec.id}
                    className={`p-4 rounded-lg border ${
                      rec.priority === 'high'
                        ? 'border-red-200 bg-red-50'
                        : rec.priority === 'medium'
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start">
                      <Badge
                        variant={
                          rec.priority === 'high'
                            ? 'destructive'
                            : rec.priority === 'medium'
                            ? 'warning'
                            : 'default'
                        }
                        className="capitalize"
                      >
                        {rec.priority} priority
                      </Badge>
                    </div>
                    <p className="mt-2 text-gray-800">{rec.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="ghost"
                className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50"
                onClick={() => setActiveTab('recommendations')}
              >
                View all recommendations
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <ShoppingCart className="mr-2 h-5 w-5 text-blue-500" />
                Top Selling Products Forecast
              </CardTitle>
              <CardDescription>
                Predicted performance of your best-selling products
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={predictiveData.topSellingProducts}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="currentSales" fill="#8884d8" name="Current Sales" />
                  <Bar dataKey="predictedSales" fill="#82ca9d" name="Predicted Sales" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Forecast Tab */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <TrendingUp className="mr-2 h-5 w-5 text-purple-600" />
                  Sales Trend Forecast
                </CardTitle>
                <CardDescription>
                  Predicted sales trends for the next {timeframe === 'weekly' ? '4 weeks' : timeframe === 'monthly' ? '6 months' : '4 quarters'}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={predictiveData.salesTrend}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#8884d8"
                      name="Actual Sales"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#82ca9d"
                      name="Predicted Sales"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
              <CardFooter className="bg-gray-50 text-sm text-gray-600">
                <p>AI predicts a {Math.round((predictiveData.salesTrend[6].predicted / predictiveData.salesTrend[4].actual - 1) * 100)}% increase in sales over the next two months</p>
              </CardFooter>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">Forecast Confidence</CardTitle>
                <CardDescription>
                  AI confidence in sales predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Overall Confidence</span>
                      <span className="text-sm font-medium">82%</span>
                    </div>
                    <Progress value={82} className="h-2" />
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Confidence by Category</h4>
                    <div className="space-y-3">
                      {predictiveData.categoryPerformance.slice(0, 4).map((category, index) => (
                        <div key={category.name}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">{category.name}</span>
                            <span className="text-sm">{75 + index * 3}%</span>
                          </div>
                          <Progress value={75 + index * 3} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">Top Products Forecast</CardTitle>
                <CardDescription>
                  Predicted sales for top-selling products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictiveData.topSellingProducts.map((product) => (
                    <div key={product.id} className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.category}</p>
                        </div>
                        <Badge variant={
                          (product.predictedSales / product.currentSales - 1) > 0.1
                            ? "success"
                            : (product.predictedSales / product.currentSales - 1) < 0
                            ? "destructive"
                            : "outline"
                        }>
                          {Math.round((product.predictedSales / product.currentSales - 1) * 100)}%
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Current: {product.currentSales} units</span>
                          <span>Predicted: {product.predictedSales} units</span>
                        </div>
                        <Progress
                          value={(product.predictedSales / (product.currentSales * 1.5)) * 100}
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">Category Performance</CardTitle>
                <CardDescription>
                  Predicted sales by product category
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={predictiveData.categoryPerformance}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="actual" name="Current Sales %" fill="#8884d8" />
                    <Bar dataKey="predicted" name="Predicted Sales %" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Sales Forecast Insights</CardTitle>
              <CardDescription>
                AI-generated insights based on sales predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-purple-100 bg-purple-50">
                  <h3 className="font-medium text-purple-800 mb-2">Seasonal Trends</h3>
                  <p className="text-gray-700">Sales are predicted to increase by 10.5% in the next quarter, with dairy and bakery products showing the strongest growth.</p>
                </div>
                <div className="p-4 rounded-lg border border-blue-100 bg-blue-50">
                  <h3 className="font-medium text-blue-800 mb-2">Growth Categories</h3>
                  <p className="text-gray-700">Dairy products are projected to see the highest growth rate at 14.3%, followed by bakery items at 13.6%.</p>
                </div>
                <div className="p-4 rounded-lg border border-green-100 bg-green-50">
                  <h3 className="font-medium text-green-800 mb-2">Stock Recommendations</h3>
                  <p className="text-gray-700">Consider increasing stock levels for milk, eggs, and bread by 15-20% to meet projected demand increases.</p>
                </div>
                <div className="p-4 rounded-lg border border-yellow-100 bg-yellow-50">
                  <h3 className="font-medium text-yellow-800 mb-2">Pricing Optimization</h3>
                  <p className="text-gray-700">Based on demand elasticity, a 5% price increase on premium dairy products could increase margins without affecting sales volume.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expiry Risk Tab */}
        <TabsContent value="expiry" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
                  Expiry Risk Analysis
                </CardTitle>
                <CardDescription>
                  Products at risk of expiring based on current sales velocity and stock levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictiveData.expiryRisk.map((product) => (
                    <div key={product.id} className="p-4 rounded-lg border border-gray-200 hover:border-orange-200 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium">{product.name}</h3>
                            <Badge
                              variant={product.riskScore > 70 ? "destructive" : product.riskScore > 50 ? "warning" : "outline"}
                              className="ml-2"
                            >
                              {product.riskScore}% risk
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{product.category} • {product.stock} units in stock</p>
                        </div>

                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Risk Level:</span>
                            <Progress
                              value={product.riskScore}
                              className="h-2 w-24"
                              indicatorClassName={
                                product.riskScore > 70 ? "bg-red-500" :
                                product.riskScore > 50 ? "bg-yellow-500" :
                                "bg-green-500"
                              }
                            />
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Sales Velocity: <span className="font-medium capitalize">{product.salesVelocity}</span>
                          </p>
                        </div>

                        <div>
                          <Button size="sm" variant="outline" className="text-orange-500 border-orange-200 hover:bg-orange-50">
                            View Details
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <h4 className="text-sm font-medium mb-1">AI Recommendation:</h4>
                        <p className="text-sm text-gray-700">
                          {product.riskScore > 70
                            ? `Consider a ${Math.round(product.riskScore/10)}% discount to accelerate sales before expiry.`
                            : product.riskScore > 50
                            ? "Monitor closely and consider bundling with fast-moving products."
                            : "Current sales pace should clear inventory before expiry concerns."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">Expiry Risk Overview</CardTitle>
                <CardDescription>
                  Distribution of products by expiry risk level
                </CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'High Risk', value: 15, color: '#ef4444' },
                        { name: 'Medium Risk', value: 25, color: '#f59e0b' },
                        { name: 'Low Risk', value: 60, color: '#10b981' },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: 'High Risk', value: 15, color: '#ef4444' },
                        { name: 'Medium Risk', value: 25, color: '#f59e0b' },
                        { name: 'Low Risk', value: 60, color: '#10b981' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
              <CardFooter className="bg-gray-50 flex flex-col items-start text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <p>High Risk: 15% of inventory (8 products)</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <p>Medium Risk: 25% of inventory (13 products)</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <p>Low Risk: 60% of inventory (32 products)</p>
                </div>
              </CardFooter>
            </Card>
          </div>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Risk Mitigation Strategies</CardTitle>
              <CardDescription>
                AI-recommended strategies to reduce expiry risk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-red-100 bg-red-50">
                  <h3 className="font-medium text-red-800 mb-2">High Risk Products</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Apply 15-25% discounts to accelerate sales</li>
                    <li>Create bundle offers with popular items</li>
                    <li>Feature prominently in store displays</li>
                    <li>Consider donations for tax benefits if near expiry</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg border border-yellow-100 bg-yellow-50">
                  <h3 className="font-medium text-yellow-800 mb-2">Medium Risk Products</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Apply modest 5-10% discounts</li>
                    <li>Increase visibility in store layout</li>
                    <li>Include in promotional materials</li>
                    <li>Monitor sales velocity weekly</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg border border-green-100 bg-green-50">
                  <h3 className="font-medium text-green-800 mb-2">Inventory Management</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Implement FIFO (First In, First Out) strictly</li>
                    <li>Adjust order quantities for slow-moving items</li>
                    <li>Review supplier terms for return policies</li>
                    <li>Train staff on expiry monitoring procedures</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Category Risk Analysis</CardTitle>
              <CardDescription>
                Expiry risk distribution by product category
              </CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Dairy', high: 4, medium: 6, low: 12 },
                    { name: 'Produce', high: 7, medium: 5, low: 8 },
                    { name: 'Bakery', high: 3, medium: 7, low: 15 },
                    { name: 'Meat', high: 2, medium: 4, low: 10 },
                    { name: 'Beverages', high: 1, medium: 3, low: 18 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  stackOffset="expand"
                  layout="vertical"
                  barSize={30}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip formatter={(value, name) => [`${(value * 100).toFixed(0)}%`, name]} />
                  <Legend />
                  <Bar dataKey="high" name="High Risk" stackId="a" fill="#ef4444" />
                  <Bar dataKey="medium" name="Medium Risk" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="low" name="Low Risk" stackId="a" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
                    AI-Powered Recommendations
                  </CardTitle>
                  <CardDescription>
                    Smart suggestions to optimize inventory, reduce waste, and boost sales
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all">
                    <TabsList className="mb-4">
                      <TabsTrigger value="all">All Recommendations</TabsTrigger>
                      <TabsTrigger value="stock">Stock Management</TabsTrigger>
                      <TabsTrigger value="promotion">Promotions</TabsTrigger>
                      <TabsTrigger value="expiry">Expiry Management</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-4">
                      {predictiveData.recommendations.map((rec) => (
                        <RecommendationCard key={rec.id} recommendation={rec} />
                      ))}
                    </TabsContent>

                    <TabsContent value="stock" className="space-y-4">
                      {predictiveData.recommendations
                        .filter(rec => rec.type === 'stock')
                        .map((rec) => (
                          <RecommendationCard key={rec.id} recommendation={rec} />
                        ))}
                    </TabsContent>

                    <TabsContent value="promotion" className="space-y-4">
                      {predictiveData.recommendations
                        .filter(rec => rec.type === 'promotion')
                        .map((rec) => (
                          <RecommendationCard key={rec.id} recommendation={rec} />
                        ))}
                    </TabsContent>

                    <TabsContent value="expiry" className="space-y-4">
                      {predictiveData.recommendations
                        .filter(rec => rec.type === 'expiry')
                        .map((rec) => (
                          <RecommendationCard key={rec.id} recommendation={rec} />
                        ))}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">Recommendation Impact</CardTitle>
                <CardDescription>
                  Estimated impact of implementing AI recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Revenue', current: 100, withRecommendations: 112 },
                      { name: 'Profit Margin', current: 100, withRecommendations: 115 },
                      { name: 'Inventory Cost', current: 100, withRecommendations: 92 },
                      { name: 'Waste', current: 100, withRecommendations: 78 },
                      { name: 'Customer Satisfaction', current: 100, withRecommendations: 108 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Relative to Current (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Performance']} />
                    <Legend />
                    <Bar dataKey="current" name="Current" fill="#8884d8" />
                    <Bar dataKey="withRecommendations" name="With Recommendations" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
              <CardFooter className="bg-gray-50 text-sm text-gray-600">
                <p>Implementing all high-priority recommendations could increase profit margin by approximately 15%</p>
              </CardFooter>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">Implementation Priority</CardTitle>
                <CardDescription>
                  Recommended order of implementation based on impact and effort
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-red-100 bg-red-50">
                    <h3 className="font-medium text-red-800 mb-2">Immediate Actions (Week 1)</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Increase Milk stock by 15%</li>
                      <li>Apply discounts to high-risk expiry products</li>
                      <li>Reposition Dairy products for better visibility</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border border-yellow-100 bg-yellow-50">
                    <h3 className="font-medium text-yellow-800 mb-2">Short-term Actions (Weeks 2-3)</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Launch promotion on Chicken products</li>
                      <li>Reduce Rice inventory by 10%</li>
                      <li>Implement bundle offers for medium-risk products</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border border-green-100 bg-green-50">
                    <h3 className="font-medium text-green-800 mb-2">Medium-term Actions (Month 1-2)</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Expand Dairy product variety</li>
                      <li>Adjust order quantities for slow-moving items</li>
                      <li>Review and optimize store layout based on sales data</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Recommendation Insights</CardTitle>
              <CardDescription>
                Key insights driving AI recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-blue-100 bg-blue-50">
                  <h3 className="font-medium text-blue-800 mb-2">Sales Patterns</h3>
                  <p className="text-gray-700">Dairy products show consistent 15% higher sales on weekends, suggesting opportunity for targeted promotions and increased stock levels for weekend shopping.</p>
                </div>

                <div className="p-4 rounded-lg border border-purple-100 bg-purple-50">
                  <h3 className="font-medium text-purple-800 mb-2">Customer Behavior</h3>
                  <p className="text-gray-700">Analysis shows customers who purchase bread are 68% more likely to also purchase milk or eggs, creating bundling opportunities to increase average transaction value.</p>
                </div>

                <div className="p-4 rounded-lg border border-pink-100 bg-pink-50">
                  <h3 className="font-medium text-pink-800 mb-2">Inventory Efficiency</h3>
                  <p className="text-gray-700">Current rice inventory levels are 27% higher than optimal based on sales velocity, representing an opportunity to reduce carrying costs without affecting availability.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
