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
import { Brain, TrendingUp, ShoppingCart, AlertTriangle, ArrowRight, RefreshCw, Lightbulb } from 'lucide-react';

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

        {/* Other tabs would be implemented similarly */}
        <TabsContent value="sales" className="space-y-6">
          {/* Sales forecast detailed content */}
        </TabsContent>

        <TabsContent value="expiry" className="space-y-6">
          {/* Expiry risk detailed content */}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {/* Recommendations detailed content */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
