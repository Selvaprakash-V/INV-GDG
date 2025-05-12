'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/app/AuthenticatedLayout';
import SessionWrapper from '@/components/SessionWrapper';
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
  Search, Bell, Settings, LogOut, ChevronDown, Edit, Trash2,
  Calendar as CalendarIcon, Package, AlertCircle, BarChart2, Brain, MoreHorizontal,
  PieChart as PieChartIcon
} from 'lucide-react';
import dynamic from 'next/dynamic';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';

// Dynamically import chart components to avoid SSR issues
const PredictiveAnalysis = dynamic(
  () => import('@/components/admin/PredictiveAnalysis'),
  { ssr: false }
);

// Import dashboard chart components
const DashboardCharts = {
  StockTrendChart: dynamic(() => import('@/components/admin/DashboardCharts').then(mod => mod.StockTrendChart), { ssr: false }),
  StockLevelDistributionChart: dynamic(() => import('@/components/admin/DashboardCharts').then(mod => mod.StockLevelDistributionChart), { ssr: false }),
  CategoryStockChart: dynamic(() => import('@/components/admin/DashboardCharts').then(mod => mod.CategoryStockChart), { ssr: false }),
  TopProductsChart: dynamic(() => import('@/components/admin/DashboardCharts').then(mod => mod.TopProductsChart), { ssr: false })
};

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

export default function ClientAdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [inventoryData, setInventoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      if (status === 'authenticated') {
        try {
          setIsLoading(true);
          const response = await fetch('/api/products');
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch products');
          }

          // Transform the data to match the expected format
          const formattedData = data.products.map(product => {
            // Calculate status based on expiry date
            const expiryDate = new Date(product.expiryDate);
            const today = new Date();
            const diffTime = expiryDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let status = 'fresh';
            if (diffDays <= 0) {
              status = 'expired';
            } else if (diffDays <= 7) {
              status = 'expiring';
            } else if (product.stock === 0) {
              status = 'out';
            }

            return {
              id: product._id,
              name: product.name,
              category: product.category,
              stock: product.stock,
              expiry: format(new Date(product.expiryDate), 'yyyy-MM-dd'),
              expiryDate: product.expiryDate,
              status,
              price: product.price,
              barcode: product.barcode,
              description: product.description,
              image: product.image
            };
          });

          setInventoryData(formattedData);
          setError(null);
        } catch (err) {
          console.error('Error fetching products:', err);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();
  }, [status]);

  // Handle delete product
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${productToDelete}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete product');
      }

      // Remove the product from the local state
      setInventoryData(prev => prev.filter(item => item.id !== productToDelete));
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      // Show error message to user
      alert(`Error deleting product: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // State for notification settings
  const [notificationSettings, setNotificationSettings] = useState(() => {
    // Try to get settings from localStorage
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('expiryNotificationSettings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    }
    // Default settings
    return {
      expiryThreshold: 7, // Default: notify 7 days before expiry
      emailNotifications: true,
      pushNotifications: true,
      notifyDaily: true
    };
  });

  // Save notification settings to localStorage
  const saveNotificationSettings = () => {
    if (notificationSettings) {
      localStorage.setItem('expiryNotificationSettings', JSON.stringify(notificationSettings));
    }
  };

  // Expiring soon items (based on notification threshold)
  const expiringSoonItems = React.useMemo(() => {
    if (!inventoryData || !notificationSettings) return [];

    return inventoryData.filter(item => {
      const expiryDate = new Date(item.expiry);
      const today = new Date();
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= notificationSettings?.expiryThreshold && diffDays > 0;
    });
  }, [inventoryData, notificationSettings?.expiryThreshold]);

  // Expired items
  const expiredItems = React.useMemo(() => {
    if (!inventoryData) return [];

    return inventoryData.filter(item => {
      const expiryDate = new Date(item.expiry);
      const today = new Date();
      return expiryDate <= today;
    });
  }, [inventoryData]);

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
    totalItems: inventoryData.length,
    availableItems: inventoryData.filter(item => item.stock > 0).length,
    outOfStock: inventoryData.filter(item => item.stock === 0).length,
    expiringSoon: expiringSoonItems.length,
    expired: expiredItems.length,
  };

  // Data for charts
  const expiryData = [
    { name: 'Fresh', value: inventoryData.filter(item => item.status === 'fresh').length || 0, color: '#8b5cf6' },
    { name: 'Expiring', value: inventoryData.filter(item => item.status === 'expiring').length || 0, color: '#f59e0b' },
    { name: 'Expired', value: inventoryData.filter(item => item.status === 'expired').length || 0, color: '#ef4444' },
  ];

  const categoryData = [
    { name: 'Beverages', value: inventoryData.filter(item => item.category === 'Beverages').length },
    { name: 'Bakery', value: inventoryData.filter(item => item.category === 'Bakery').length },
    { name: 'Dairy', value: inventoryData.filter(item => item.category === 'Dairy').length },
    { name: 'Snacks', value: inventoryData.filter(item => item.category === 'Snacks').length },
    { name: 'Personal Care', value: inventoryData.filter(item => item.category === 'Personal Care').length },
  ];

  // Stock level distribution data
  const stockLevelData = [
    { name: 'Critical (0-10)', value: inventoryData.filter(item => item.stock >= 0 && item.stock <= 10).length, color: '#ef4444' },
    { name: 'Low (11-30)', value: inventoryData.filter(item => item.stock > 10 && item.stock <= 30).length, color: '#f59e0b' },
    { name: 'Medium (31-70)', value: inventoryData.filter(item => item.stock > 30 && item.stock <= 70).length, color: '#3b82f6' },
    { name: 'High (71+)', value: inventoryData.filter(item => item.stock > 70).length, color: '#10b981' },
  ];

  // Category-based stock data
  const categoryStockData = [
    { name: 'Beverages', stock: inventoryData.filter(item => item.category === 'Beverages').reduce((sum, item) => sum + item.stock, 0) },
    { name: 'Bakery', stock: inventoryData.filter(item => item.category === 'Bakery').reduce((sum, item) => sum + item.stock, 0) },
    { name: 'Dairy', stock: inventoryData.filter(item => item.category === 'Dairy').reduce((sum, item) => sum + item.stock, 0) },
    { name: 'Snacks', stock: inventoryData.filter(item => item.category === 'Snacks').reduce((sum, item) => sum + item.stock, 0) },
    { name: 'Personal Care', stock: inventoryData.filter(item => item.category === 'Personal Care').reduce((sum, item) => sum + item.stock, 0) },
  ];

  // Top 5 products by stock
  const topProductsByStock = [...inventoryData]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5)
    .map(item => ({ name: item.name, stock: item.stock }));

  // Low stock products (less than 15 units)
  const lowStockProducts = inventoryData
    .filter(item => item.stock > 0 && item.stock < 15)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  // Mock data for stock trend (in a real app, this would come from historical data)
  const stockTrendData = [
    { name: 'Jan', stock: 320 },
    { name: 'Feb', stock: 350 },
    { name: 'Mar', stock: 290 },
    { name: 'Apr', stock: 400 },
    { name: 'May', stock: 380 },
    { name: 'Jun', stock: 420 },
    { name: 'Jul', stock: 450 },
    { name: 'Aug', stock: 470 },
    { name: 'Sep', stock: 490 },
    { name: 'Oct', stock: 520 },
    { name: 'Nov', stock: 550 },
    { name: 'Dec', stock: inventoryData.reduce((sum, item) => sum + item.stock, 0) },
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
      case 'alerts':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Expiry Alerts</h2>
                <p className="text-gray-600">Monitor products that are about to expire</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Notification Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Notification Settings</DialogTitle>
                    <DialogDescription>
                      Configure when and how you want to receive expiry notifications
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Notify me when products are expiring in:</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          max="90"
                          value={notificationSettings?.expiryThreshold || 7}
                          onChange={(e) => setNotificationSettings(prev => ({
                            ...prev,
                            expiryThreshold: parseInt(e.target.value) || 7
                          }))}
                          className="w-20"
                        />
                        <span>days</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Email Notifications</label>
                      <Button
                        variant={notificationSettings?.emailNotifications ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNotificationSettings(prev => ({
                          ...prev,
                          emailNotifications: !prev?.emailNotifications
                        }))}
                      >
                        {notificationSettings?.emailNotifications ? "Enabled" : "Disabled"}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Push Notifications</label>
                      <Button
                        variant={notificationSettings?.pushNotifications ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNotificationSettings(prev => ({
                          ...prev,
                          pushNotifications: !prev?.pushNotifications
                        }))}
                      >
                        {notificationSettings?.pushNotifications ? "Enabled" : "Disabled"}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Daily Digest</label>
                      <Button
                        variant={notificationSettings?.notifyDaily ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNotificationSettings(prev => ({
                          ...prev,
                          notifyDaily: !prev?.notifyDaily
                        }))}
                      >
                        {notificationSettings?.notifyDaily ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      onClick={() => {
                        saveNotificationSettings();
                        // Show a success message or toast notification here
                        alert('Notification settings saved successfully!');
                      }}
                    >
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Expiry Timeline */}
            <Card className="border border-gray-200">
              <CardHeader className="bg-orange-50 border-b border-orange-100">
                <CardTitle className="flex items-center text-orange-800">
                  <AlertCircle className="mr-2 h-5 w-5 text-orange-600" />
                  Expiry Timeline
                </CardTitle>
                <CardDescription>
                  Products expiring within {notificationSettings?.expiryThreshold || 7} days
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {expiringSoonItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-green-50 p-3 rounded-full mb-4">
                      <Package className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No products expiring soon</h3>
                    <p className="text-gray-500 max-w-md mt-1">
                      All your products are fresh! You'll be notified here when products are about to expire.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {expiringSoonItems.map((item) => {
                      const expiryDate = new Date(item.expiry);
                      const today = new Date();
                      const diffTime = expiryDate.getTime() - today.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                      return (
                        <div key={item.id} className="p-4 hover:bg-orange-50/30 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-full ${
                                diffDays <= 3 ? 'bg-red-100' : 'bg-orange-100'
                              }`}>
                                <AlertCircle className={`h-5 w-5 ${
                                  diffDays <= 3 ? 'text-red-500' : 'text-orange-500'
                                }`} />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{item.name}</h4>
                                <p className="text-sm text-gray-500">{item.category} • Stock: {item.stock}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={diffDays <= 3 ? "destructive" : "warning"} className="mb-1">
                                {diffDays} {diffDays === 1 ? 'day' : 'days'} left
                              </Badge>
                              <p className="text-sm text-gray-500">Expires on {item.expiry}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/edit-product/${item.id}`)}
                            >
                              <Edit className="mr-1 h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              Mark as Notified
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expired Products */}
            <Card className="border border-gray-200">
              <CardHeader className="bg-red-50 border-b border-red-100">
                <CardTitle className="flex items-center text-red-800">
                  <AlertCircle className="mr-2 h-5 w-5 text-red-600" />
                  Expired Products
                </CardTitle>
                <CardDescription>
                  Products that have already expired and need attention
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {expiredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-green-50 p-3 rounded-full mb-4">
                      <Package className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No expired products</h3>
                    <p className="text-gray-500 max-w-md mt-1">
                      You don't have any expired products in your inventory.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {expiredItems.map((item) => (
                      <div key={item.id} className="p-4 hover:bg-red-50/30 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-red-100">
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-500">{item.category} • Stock: {item.stock}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="destructive" className="mb-1">
                              Expired
                            </Badge>
                            <p className="text-sm text-gray-500">Expired on {item.expiry}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/edit-product/${item.id}`)}
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setProductToDelete(item.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
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
              <Button
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                onClick={() => router.push('/admin/add-product')}
              >
                Add New Item
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
              </div>
            ) : error ? (
              <Card className="border border-red-200 p-6">
                <div className="text-center text-red-600">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">Error Loading Products</h3>
                  <p>{error}</p>
                </div>
              </Card>
            ) : (
              <Card className="border border-gray-200">
                {inventoryData.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-600">No products found</h3>
                    <p className="text-gray-500 mt-1">Add your first product to get started</p>
                    <Button
                      className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => router.push('/admin/add-product')}
                    >
                      Add Product
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-purple-50">
                      <TableRow>
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
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={(item.stock / 200) * 100}
                                className="h-2 w-24"
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
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => router.push(`/admin/edit-product/${item.id}`)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    setProductToDelete(item.id);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Card>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure you want to delete this product?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently remove the product from your inventory.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteProduct}
                    disabled={isDeleting}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Dashboard Overview</h2>
            <p className="text-gray-600">Welcome to your inventory management dashboard</p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
                <StatCard
                  title="Total Products"
                  value={stats.totalItems}
                  icon={<Package className="h-5 w-5 text-purple-600" />}
                  color="bg-white"
                  textColor="text-purple-600"
                />
              </motion.div>
              <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
                <StatCard
                  title="Available Products"
                  value={stats.availableItems}
                  icon={<Package className="h-5 w-5 text-green-600" />}
                  color="bg-white"
                  textColor="text-green-600"
                />
              </motion.div>
              <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
                <StatCard
                  title="Out of Stock"
                  value={stats.outOfStock}
                  icon={<AlertCircle className="h-5 w-5 text-red-600" />}
                  color="bg-white"
                  textColor="text-red-600"
                />
              </motion.div>
              <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
                <StatCard
                  title="Expiring Soon"
                  value={stats.expiringSoon}
                  icon={<AlertCircle className="h-5 w-5 text-yellow-600" />}
                  color="bg-white"
                  textColor="text-yellow-600"
                />
              </motion.div>
            </div>

            {/* Stock Overview Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stock Trend Chart */}
              <DashboardCharts.StockTrendChart data={stockTrendData} />

              {/* Stock Level Distribution */}
              <DashboardCharts.StockLevelDistributionChart data={stockLevelData} />
            </div>

            {/* Category Stock and Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Stock Chart */}
              <DashboardCharts.CategoryStockChart data={categoryStockData} />

              {/* Top Products by Stock */}
              <DashboardCharts.TopProductsChart data={topProductsByStock} />
            </div>

            {/* Low Stock Alert and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Low Stock Alert */}
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100">
                  <CardTitle className="flex items-center text-red-800">
                    <AlertCircle className="mr-2 h-5 w-5 text-red-600" />
                    Low Stock Alert
                  </CardTitle>
                  <CardDescription>
                    Products that need to be restocked soon
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {lowStockProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="bg-green-50 p-3 rounded-full mb-4">
                        <Package className="h-8 w-8 text-green-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">No low stock products</h3>
                      <p className="text-gray-500 max-w-md mt-1">
                        All your products have sufficient stock levels.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {lowStockProducts.map((item) => (
                        <div key={item.id} className="p-4 hover:bg-red-50/30 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-full bg-red-100">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{item.name}</h4>
                                <p className="text-sm text-gray-500">{item.category} • Stock: {item.stock}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="destructive" className="mb-1">
                                Low Stock
                              </Badge>
                              <Progress
                                value={(item.stock / 100) * 100}
                                className={`h-2 w-24 mt-1 ${item.stock < 5 ? "bg-red-500" : "bg-orange-500"}`}
                              />
                            </div>
                          </div>
                          <div className="mt-3 flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/edit-product/${item.id}`)}
                            >
                              <Edit className="mr-1 h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              Restock
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-violet-50 to-indigo-50 border-b border-violet-100">
                  <CardTitle className="flex items-center text-violet-800">
                    <Settings className="mr-2 h-5 w-5 text-violet-600" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Common tasks and shortcuts
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 gap-4">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 h-12"
                        onClick={() => router.push('/admin/add-product')}
                      >
                        <Package className="mr-2 h-5 w-5" />
                        Add New Product
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        className="w-full h-12 border-purple-200 hover:bg-purple-50"
                        onClick={() => handleTabChange('inventory')}
                      >
                        <BarChart2 className="mr-2 h-5 w-5 text-purple-600" />
                        View Full Inventory
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        className="w-full h-12 border-orange-200 hover:bg-orange-50"
                        onClick={() => handleTabChange('alerts')}
                      >
                        <AlertCircle className="mr-2 h-5 w-5 text-orange-600" />
                        Check Expiry Alerts
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        className="w-full h-12 border-blue-200 hover:bg-blue-50"
                        onClick={() => handleTabChange('reports')}
                      >
                        <BarChart2 className="mr-2 h-5 w-5 text-blue-600" />
                        Generate Reports
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
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
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-purple-600 relative"
              onClick={() => handleTabChange('alerts')}
            >
              <Bell className="h-5 w-5" />
              {expiringSoonItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {expiringSoonItems.length}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-purple-600">
              <Settings className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-600 hover:text-purple-600">
                  <span>Admin</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
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
              { name: 'Dashboard', icon: <BarChart2 className="h-5 w-5" />, tab: 'dashboard', badge: null },
              { name: 'Inventory', icon: <Package className="h-5 w-5" />, tab: 'inventory', badge: null },
              { name: 'Expiry Alerts', icon: <AlertCircle className="h-5 w-5" />, tab: 'alerts', badge: expiringSoonItems.length > 0 ? expiringSoonItems.length : null },
              { name: 'Reports', icon: <BarChart2 className="h-5 w-5" />, tab: 'reports', badge: null },
              { name: 'Calendar', icon: <CalendarIcon className="h-5 w-5" />, tab: 'calendar', badge: null },
              { name: 'AI Analysis', icon: <Brain className="h-5 w-5" />, tab: 'ai-analysis', badge: null },
            ].map((item) => (
              <motion.div
                key={item.name}
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <button
                  onClick={() => handleTabChange(item.tab)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.tab
                      ? 'bg-purple-100 text-purple-700 font-medium'
                      : 'text-gray-600 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-purple-600">{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
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
