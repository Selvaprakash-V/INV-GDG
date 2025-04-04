'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
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
  Calendar, Package, AlertCircle, BarChart2 
} from 'lucide-react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export default function AdminDashboard() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Sample inventory data
  const inventoryData = [
    { id: 1, name: 'Organic Apples', category: 'Fruits', stock: 150, expiry: '2023-12-15', status: 'fresh' },
    { id: 2, name: 'Whole Grain Bread', category: 'Bakery', stock: 42, expiry: '2023-11-28', status: 'expiring' },
    { id: 3, name: 'Almond Milk', category: 'Dairy', stock: 0, expiry: '2023-11-20', status: 'out' },
    { id: 4, name: 'Free Range Eggs', category: 'Dairy', stock: 89, expiry: '2023-12-05', status: 'fresh' },
    { id: 5, name: 'Greek Yogurt', category: 'Dairy', stock: 23, expiry: '2023-11-25', status: 'expiring' },
    { id: 6, name: 'Organic Spinach', category: 'Vegetables', stock: 56, expiry: '2023-11-22', status: 'expired' },
    { id: 7, name: 'Quinoa', category: 'Grains', stock: 34, expiry: '2024-01-15', status: 'fresh' },
  ];

  // Filter data based on search
  const filteredData = inventoryData.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const stats = {
    totalItems: inventoryData.length,
    availableItems: inventoryData.filter(item => item.stock > 0).length,
    outOfStock: inventoryData.filter(item => item.stock === 0).length,
    expiringSoon: inventoryData.filter(item => item.status === 'expiring').length,
    expired: inventoryData.filter(item => item.status === 'expired').length,
  };

  // Data for charts
  const expiryData = [
    { name: 'Fresh', value: inventoryData.filter(item => item.status === 'fresh').length, color: '#8b5cf6' },
    { name: 'Expiring', value: inventoryData.filter(item => item.status === 'expiring').length, color: '#f59e0b' },
    { name: 'Expired', value: inventoryData.filter(item => item.status === 'expired').length, color: '#ef4444' },
  ];

  const categoryData = [
    { name: 'Fruits', value: inventoryData.filter(item => item.category === 'Fruits').length },
    { name: 'Bakery', value: inventoryData.filter(item => item.category === 'Bakery').length },
    { name: 'Dairy', value: inventoryData.filter(item => item.category === 'Dairy').length },
    { name: 'Vegetables', value: inventoryData.filter(item => item.category === 'Vegetables').length },
    { name: 'Grains', value: inventoryData.filter(item => item.category === 'Grains').length },
  ];

  // Scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 text-gray-800 font-sans">
      {/* Header - Matches Home Page Theme */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 shadow-md backdrop-blur-sm' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/">
              <h1 className="text-3xl font-extrabold tracking-wide hover:scale-105 transition-transform duration-300 text-purple-600">
                INNOVAID
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
        {/* Sidebar - Purple Theme */}
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
              { name: 'Calendar', icon: <Calendar className="h-5 w-5" />, tab: 'calendar' },
            ].map((item) => (
              <motion.div
                key={item.name}
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <button
                  onClick={() => setActiveTab(item.tab)}
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
          {/* Dashboard Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-800">Inventory Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your inventory and track expiry dates</p>
          </motion.div>

          {/* Search and Filter - Purple Theme */}
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

          {/* Stats Overview - Color Matched to Home Page */}
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

          {/* Visualizations - Purple Accents */}
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

          {/* Inventory Table - Purple Highlights */}
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
                          indicatorColor={
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
        </main>
      </div>
    </div>
  );
}

// Stat Card Component - Themed to Match Home Page
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