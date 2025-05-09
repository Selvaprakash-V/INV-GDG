'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Search, Bell, Settings, LogOut, ChevronDown,
  Calendar as CalendarIcon, Package, AlertCircle, BarChart2, Brain
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the PredictiveAnalysis component to avoid SSR issues with charts
const PredictiveAnalysis = dynamic(
  () => import('@/components/admin/PredictiveAnalysis'),
  { ssr: false }
);
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export default function AdminDashboard() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Sample inventory data
  const inventoryData = [

      { id: 1, name: 'Coca-Cola Can', category: 'Beverages', stock: 150, expiry: '2026-01-15', status: 'fresh' },
      { id: 2, name: 'Whole Grain Bread', category: 'Bakery', stock: 42, expiry: '2025-06-30', status: 'expiring' },
      { id: 3, name: 'Almond Milk', category: 'Dairy', stock: 0, expiry: '2025-07-20', status: 'out' },
      { id: 4, name: 'Free Range Eggs', category: 'Dairy', stock: 89, expiry: '2025-06-05', status: 'fresh' },
      { id: 5, name: 'Greek Yogurt', category: 'Dairy', stock: 23, expiry: '2025-06-25', status: 'expiring' },
      { id: 6, name: 'Lays Classic Chips', category: 'Snacks', stock: 56, expiry: '2025-10-22', status: 'fresh' },
      { id: 7, name: 'Dettol Hand Wash', category: 'Personal Care', stock: 34, expiry: '2026-03-15', status: 'fresh' },
      { id: 8, name: 'Pepsi Bottle', category: 'Beverages', stock: 150, expiry: '2026-01-30', status: 'fresh' },
      { id: 9, name: 'Whole Grain Bread', category: 'Bakery', stock: 42, expiry: '2025-06-28', status: 'expiring' },
      { id: 10, name: 'Almond Milk', category: 'Dairy', stock: 0, expiry: '2025-07-20', status: 'out' },
      { id: 11, name: 'Free Range Eggs', category: 'Dairy', stock: 89, expiry: '2025-06-05', status: 'fresh' },
      { id: 12, name: 'Greek Yogurt', category: 'Dairy', stock: 23, expiry: '2025-06-25', status: 'expiring' },
      { id: 13, name: 'Lays Classic Chips', category: 'Snacks', stock: 56, expiry: '2025-10-22', status: 'fresh' },
      { id: 14, name: 'Dettol Hand Wash', category: 'Personal Care', stock: 34, expiry: '2026-03-15', status: 'fresh' }


  ];

  // Expiring soon items (within 7 days)
  const expiringSoonItems = inventoryData.filter(item => {
    const expiryDate = new Date(item.expiry);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0 && item.status !== 'expired';
  });

  // Expired items
  const expiredItems = inventoryData.filter(item => {
    const expiryDate = new Date(item.expiry);
    const today = new Date();
    return expiryDate < today && item.status !== 'fresh';
  });

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const itemsExpiring = inventoryData.filter(item => item.expiry === dateStr);
      days.push({
        day: i,
        itemsExpiring,
        isToday: new Date().getDate() === i &&
                new Date().getMonth() === currentMonth &&
                new Date().getFullYear() === currentYear
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle month navigation
  const handleMonthChange = (increment) => {
    setCurrentMonth(prev => {
      let newMonth = prev + increment;
      let newYear = currentYear;

      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }

      setCurrentYear(newYear);
      return newMonth;
    });
  };

  // Filter data based on search
  const filteredData = inventoryData.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const stats = {
    totalItems: 227,  // Changed from inventoryData.length to 227
    availableItems: 197,
    outOfStock: 12,
    expiringSoon: 11,
    expired: 19,
  };

  // Data for charts
 // Replace the expiryData array with these new values:
const expiryData = [
  { name: 'Fresh', value: 86.78, color: '#8b5cf6' },
  { name: 'Expiring', value: 4.84, color: '#f59e0b' },
  { name: 'Expired', value: 8.37, color: '#ef4444' },
];
  const categoryData = [
    { name: 'Beverages', value: inventoryData.filter(item => item.category === 'Beverages').length },
    { name: 'Bakery', value: inventoryData.filter(item => item.category === 'Bakery').length },
    { name: 'Dairy', value: inventoryData.filter(item => item.category === 'Dairy').length },
    { name: 'Snacks', value: inventoryData.filter(item => item.category === 'Snacks').length },
    { name: 'Personal Care', value: inventoryData.filter(item => item.category === 'Personal Care').length },
  ];

  // Scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Render different content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'inventory':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Inventory Management</h2>
            <p className="text-gray-600">View and manage all your inventory items</p>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search inventory..."
                  className="pl-10 bg-white shadow-sm border border-gray-200 focus:border-purple-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
                Add New Item
              </Button>
            </div>

            <Card className="border border-gray-200">
              <Table>
                <TableHeader className="bg-purple-50">
                  <TableRow>
                    <TableHead className="w-[100px] text-purple-800">ID</TableHead>
                    <TableHead className="text-purple-800">Product</TableHead>
                    <TableHead className="text-purple-800">Category</TableHead>
                    <TableHead className="text-purple-800">Stock</TableHead>
                    <TableHead className="text-purple-800">Expiry Date</TableHead>
                    <TableHead className="text-purple-800">Status</TableHead>
                    <TableHead className="text-right text-purple-800">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-purple-50/50 transition-colors">
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(item.stock / 200) * 100}
                            className="h-2 w-24"
                            indicatorcolor={
                              item.stock > 50 ? 'bg-green-500' :
                              item.stock > 20 ? 'bg-yellow-500' : 'bg-red-500'
                            }
                          />
                          <span>{item.stock}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.expiry}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === 'fresh' ? 'default' :
                            item.status === 'expiring' ? 'warning' : 'destructive'
                          }
                          className="capitalize"
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-purple-600 hover:bg-purple-100 hover:text-purple-700">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        );
      case 'alerts':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Expiry Alerts</h2>
            <p className="text-gray-600">Products that are expiring soon or have expired</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Expiring Soon */}
              <Card className="border border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <span>Expiring Soon (Next 7 Days)</span>
                    <Badge variant="warning" className="ml-auto">{expiringSoonItems.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {expiringSoonItems.length > 0 ? (
                    <div className="space-y-4">
                      {expiringSoonItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-gray-600">Expires: {item.expiry}</p>
                          </div>
                          <Badge variant="warning">Expiring</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No items expiring soon</p>
                  )}
                </CardContent>
              </Card>

              {/* Expired Items */}
              <Card className="border border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span>Expired Items</span>
                    <Badge variant="destructive" className="ml-auto">{expiredItems.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {expiredItems.length > 0 ? (
                    <div className="space-y-4">
                      {expiredItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-gray-600">Expired on: {item.expiry}</p>
                          </div>
                          <Badge variant="destructive">Expired</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No expired items</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Inventory Reports</h2>
            <p className="text-gray-600">Generate and view inventory reports</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stock Level Report */}
              <Card>
                <CardHeader>
                  <CardTitle>Stock Levels</CardTitle>
                  <CardDescription>Current inventory stock levels by category</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8b5cf6" name="Products" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Expiry Status Report */}
              <Card>
                <CardHeader>
                  <CardTitle>Expiry Status</CardTitle>
                  <CardDescription>Distribution of product expiry status</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expiryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {expiryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Low Stock Items</CardTitle>
                  <CardDescription>Items with stock below 20 units</CardDescription>
                </CardHeader>
                <CardContent>
                  {inventoryData.filter(item => item.stock < 20 && item.stock > 0).map(item => (
                    <div key={item.id} className="py-2 border-b border-gray-100 last:border-0">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">Stock: {item.stock}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Out of Stock</CardTitle>
                  <CardDescription>Items currently out of stock</CardDescription>
                </CardHeader>
                <CardContent>
                  {inventoryData.filter(item => item.stock === 0).map(item => (
                    <div key={item.id} className="py-2 border-b border-gray-100 last:border-0">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">Category: {item.category}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Expiries</CardTitle>
                  <CardDescription>Items expired in last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  {expiredItems.map(item => (
                    <div key={item.id} className="py-2 border-b border-gray-100 last:border-0">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">Expired: {item.expiry}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'calendar':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Inventory Calendar</h2>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMonthChange(-1)}
                >
                  Previous
                </Button>
                <h3 className="text-xl font-semibold">
                  {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMonthChange(1)}
                >
                  Next
                </Button>
              </div>
            </div>
            <p className="text-gray-600">View expiry dates and inventory events</p>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="bg-purple-50 p-2 text-center font-medium text-purple-800">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`bg-white min-h-24 p-2 ${day?.isToday ? 'ring-2 ring-purple-500' : ''}`}
                  >
                    {day ? (
                      <>
                        <div className={`text-right font-medium ${day.isToday ? 'text-purple-600' : ''}`}>
                          {day.day}
                        </div>
                        {day.itemsExpiring.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {day.itemsExpiring.slice(0, 2).map(item => (
                              <div
                                key={item.id}
                                className="text-xs p-1 rounded bg-red-50 text-red-700 truncate"
                                title={`${item.name} expires today`}
                              >
                                {item.name}
                              </div>
                            ))}
                            {day.itemsExpiring.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{day.itemsExpiring.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Expiries</CardTitle>
                <CardDescription>Items expiring in the next 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Days Left</TableHead>
                      <TableHead>Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryData
                      .filter(item => {
                        const expiryDate = new Date(item.expiry);
                        const today = new Date();
                        const diffTime = expiryDate.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays <= 30 && diffDays >= 0;
                      })
                      .sort((a, b) => new Date(a.expiry) - new Date(b.expiry))
                      .map(item => {
                        const expiryDate = new Date(item.expiry);
                        const today = new Date();
                        const diffTime = expiryDate.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        return (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.expiry}</TableCell>
                            <TableCell>
                              <Badge variant={diffDays <= 7 ? 'destructive' : 'warning'}>
                                {diffDays} days
                              </Badge>
                            </TableCell>
                            <TableCell>{item.stock}</TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );

      case 'ai-analysis':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <PredictiveAnalysis />
          </motion.div>
        );
      default:
        return (
          <>
            {/* Dashboard Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-gray-800">Ramalinga Stores</h1>
              <p className="text-gray-600 mt-2">Manage your inventory and track expiry dates</p>
            </motion.div>

            {/* Search and Filter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8 flex flex-col md:flex-row gap-4"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  className="pl-10 bg-white shadow-sm border border-gray-200 focus:border-purple-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="bg-white border-gray-200 hover:border-purple-300">
                  Filter
                </Button>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
                  Add Product
                </Button>
              </div>
            </motion.div>

            {/* Stats Overview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
            >
              <StatCard
                title="Total Items"
                value={stats.totalItems}
                icon={<Package className="h-6 w-6" />}
                color="bg-purple-100"
                textColor="text-purple-600"
              />
              <StatCard
                title="Available"
                value={stats.availableItems}
                icon={<Package className="h-6 w-6" />}
                color="bg-green-100"
                textColor="text-green-600"
              />
              <StatCard
                title="Out of Stock"
                value={stats.outOfStock}
                icon={<AlertCircle className="h-6 w-6" />}
                color="bg-red-100"
                textColor="text-red-600"
              />
              <StatCard
                title="Expiring Soon"
                value={stats.expiringSoon}
                icon={<AlertCircle className="h-6 w-6" />}
                color="bg-yellow-100"
                textColor="text-yellow-600"
              />
              <StatCard
                title="Expired"
                value={stats.expired}
                icon={<AlertCircle className="h-6 w-6" />}
                color="bg-red-100"
                textColor="text-red-600"
              />
            </motion.div>

            {/* Visualizations */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            >
              {/* Expiry Status Pie Chart */}
              <Card className="p-4 bg-white border border-gray-200 hover:border-purple-300 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-gray-800">Expiry Status</CardTitle>
                  <CardDescription className="text-gray-600">Distribution of product expiry status</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expiryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {expiryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Inventory by Category Bar Chart */}
              <Card className="p-4 bg-white border border-gray-200 hover:border-purple-300 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-gray-800">Inventory by Category</CardTitle>
                  <CardDescription className="text-gray-600">Product distribution across categories</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8b5cf6" name="Products" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Inventory Table */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300"
            >
              <Table>
                <TableHeader className="bg-purple-50">
                  <TableRow>
                    <TableHead className="w-[100px] text-purple-800">ID</TableHead>
                    <TableHead className="text-purple-800">Product</TableHead>
                    <TableHead className="text-purple-800">Category</TableHead>
                    <TableHead className="text-purple-800">Stock</TableHead>
                    <TableHead className="text-purple-800">Expiry Date</TableHead>
                    <TableHead className="text-purple-800">Status</TableHead>
                    <TableHead className="text-right text-purple-800">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-purple-50/50 transition-colors">
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(item.stock / 200) * 100}
                            className="h-2 w-24"
                            indicatorcolor={
                              item.stock > 50 ? 'bg-green-500' :
                              item.stock > 20 ? 'bg-yellow-500' : 'bg-red-500'
                            }
                          />
                          <span>{item.stock}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.expiry}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === 'fresh' ? 'default' :
                            item.status === 'expiring' ? 'warning' : 'destructive'
                          }
                          className="capitalize"
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-purple-600 hover:bg-purple-100 hover:text-purple-700">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 text-gray-800 font-sans">
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 shadow-md backdrop-blur-sm' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/">
  <h1 className="text-3xl font-extrabold tracking-wide hover:scale-105 transition-transform duration-300">
    <span className="text-purple-600">TRAC</span><span className="text-pink-600">KIT</span>
  </h1>
</Link>

          </motion.div>

          <div className="flex items-center space-x-4">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-purple-600" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              </Button>
            </motion.div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-2 cursor-pointer">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                    A
                  </div>
                  <ChevronDown className="h-4 w-4 text-purple-600" />
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="hidden md:block w-64 h-screen sticky top-16 bg-white/80 backdrop-blur-sm border-r border-gray-200 p-4"
        >
          <nav className="space-y-1 mt-6">
            {[
              { name: 'Dashboard', icon: <BarChart2 className="h-5 w-5" />, tab: 'dashboard' },
              { name: 'Inventory', icon: <Package className="h-5 w-5" />, tab: 'inventory' },
              { name: 'Expiry Alerts', icon: <AlertCircle className="h-5 w-5" />, tab: 'alerts' },
              { name: 'Reports', icon: <BarChart2 className="h-5 w-5" />, tab: 'reports' },
              { name: 'Calendar', icon: <CalendarIcon className="h-5 w-5" />, tab: 'calendar' },
              { name: 'AI Analysis', icon: <Brain className="h-5 w-5" />, tab: 'ai-analysis' },
            ].map((item) => (
              <motion.div
                key={item.name}
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <button
                  onClick={() => handleTabChange(item.tab)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.tab
                      ? 'bg-purple-100 text-purple-700 font-medium'
                      : 'text-gray-600 hover:bg-purple-50'
                  }`}
                >
                  <span className="text-purple-600">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              </motion.div>
            ))}
          </nav>
        </motion.aside>

        {/* Dashboard Content */}
        <main className="flex-1 p-6">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color, textColor }) {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
      <Card className={`${color} border-0 shadow-sm hover:shadow-md transition-shadow`}>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <h3 className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</h3>
            </div>
            <div className={`p-3 rounded-full ${textColor}/20`}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}