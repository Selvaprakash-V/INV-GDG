'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

export default function CustomerDashboard() {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample inventory data with expiry information
  const inventoryData = [
    { id: 1, name: 'Organic Apples', category: 'Fruits', stock: 150, price: 2.99, expiryStatus: 'fresh', purchases: 45 },
    { id: 2, name: 'Whole Grain Bread', category: 'Bakery', stock: 42, price: 3.49, expiryStatus: 'expiring', purchases: 28 },
    { id: 3, name: 'Almond Milk', category: 'Dairy', stock: 0, price: 4.29, expiryStatus: 'normal', purchases: 15 },
    { id: 4, name: 'Free Range Eggs', category: 'Dairy', stock: 89, price: 5.99, expiryStatus: 'fresh', purchases: 32 },
    { id: 5, name: 'Greek Yogurt', category: 'Dairy', stock: 23, price: 1.99, expiryStatus: 'expiring', purchases: 18 },
    { id: 6, name: 'Organic Spinach', category: 'Vegetables', stock: 56, price: 2.49, expiryStatus: 'normal', purchases: 22 },
    { id: 7, name: 'Quinoa', category: 'Grains', stock: 34, price: 6.99, expiryStatus: 'fresh', purchases: 12 },
  ];

  // Filter data based on search
  const filteredData = inventoryData.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Expiry status data for pie chart
  const expiryStatusData = [
    { name: 'Fresh', value: inventoryData.filter(item => item.expiryStatus === 'fresh').length, color: '#10b981' },
    { name: 'Expiring Soon', value: inventoryData.filter(item => item.expiryStatus === 'expiring').length, color: '#f59e0b' },
    { name: 'Normal', value: inventoryData.filter(item => item.expiryStatus === 'normal').length, color: '#8b5cf6' },
  ];

  // Purchases by category data for bar chart
  const purchasesByCategory = Array.from(new Set(inventoryData.map(item => item.category))).map(category => {
    const items = inventoryData.filter(item => item.category === category);
    const totalPurchases = items.reduce((sum, item) => sum + item.purchases, 0);
    return { 
      category,
      purchases: totalPurchases
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 text-gray-800 font-sans">
      {/* Main Content */}
      <div className="pt-16">
        <main className="p-6">
          {/* Dashboard Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-800">Product Catalog</h1>
            <p className="text-gray-600 mt-2">Browse our available products</p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                className="pl-10 bg-white shadow-sm border border-gray-200 focus:border-purple-300 max-w-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>

          {/* Visualizations */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
          >
            {/* Expiry Status Pie Chart */}
            <Card className="p-4 bg-white border border-gray-200 hover:border-purple-300 transition-all">
              <CardHeader>
                <CardTitle>Product Expiry Status</CardTitle>
                <CardDescription>Freshness status of our products</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expiryStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {expiryStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Purchases by Category Bar Chart */}
            <Card className="p-4 bg-white border border-gray-200 hover:border-purple-300 transition-all">
              <CardHeader>
                <CardTitle>Your Purchases by Category</CardTitle>
                <CardDescription>Products you've bought across categories</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={purchasesByCategory}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="category" 
                      stroke="#6b7280" 
                      angle={-45} 
                      textAnchor="end"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Bar 
                      dataKey="purchases" 
                      name="Purchases"
                      fill="#8b5cf6" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Inventory Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <Table>
              <TableHeader className="bg-purple-50">
                <TableRow>
                  <TableHead className="text-purple-800">Product</TableHead>
                  <TableHead className="text-purple-800">Category</TableHead>
                  <TableHead className="text-purple-800">Stock</TableHead>
                  <TableHead className="text-purple-800">Price</TableHead>
                  <TableHead className="text-purple-800">Expiry Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-purple-50/50 transition-colors">
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={(item.stock / 200) * 100}
                          className="h-2 w-24"
                          indicatorColor={
                            item.stock > 50 ? 'bg-green-500' : 
                            item.stock > 20 ? 'bg-yellow-500' : 'bg-red-500'
                          }
                        />
                        <span>{item.stock}</span>
                      </div>
                    </TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.expiryStatus === 'fresh' ? 'default' :
                          item.expiryStatus === 'expiring' ? 'warning' : 'secondary'
                        }
                        className="capitalize"
                      >
                        {item.expiryStatus === 'fresh' ? 'Fresh' : 
                         item.expiryStatus === 'expiring' ? 'Expiring Soon' : 'Normal'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        </main>
      </div>
    </div>
  );
}