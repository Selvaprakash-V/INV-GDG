'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Bell, ShoppingBasket, Scan, History, Settings, LogOut } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState('purchases');
  const [expiringSoon, setExpiringSoon] = useState([]);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(750);
  const [loading, setLoading] = useState(true);

  // Simulate data fetching
  useEffect(() => {
    const fetchData = async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setExpiringSoon([
        { id: 1, name: 'Organic Milk', expiryDate: '2023-12-15', daysLeft: 3, image: '/products/milk.png' },
        { id: 2, name: 'Whole Wheat Bread', expiryDate: '2023-12-18', daysLeft: 6, image: '/products/bread.png' },
        { id: 3, name: 'Greek Yogurt', expiryDate: '2023-12-20', daysLeft: 8, image: '/products/yogurt.png' }
      ]);

      setRecentPurchases([
        { id: 101, date: '2023-12-10', store: 'FreshMart', amount: 45.20, items: 8 },
        { id: 102, date: '2023-12-05', store: 'GreenGrocer', amount: 32.75, items: 5 },
        { id: 103, date: '2023-11-28', store: 'FreshMart', amount: 52.40, items: 10 }
      ]);

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100">
      {/* Dashboard Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold text-purple-600">INNOVAID</h1>
            <p className="text-sm text-gray-500">Customer Dashboard</p>
          </motion.div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-purple-600 hover:bg-purple-100">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-medium">JD</span>
              </div>
              <span className="text-sm font-medium">John Doe</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Summary Cards */}
          <div className="space-y-6">
            {/* Loyalty Points Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Loyalty Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-purple-600">{loyaltyPoints}</span>
                    <div className="text-sm text-gray-500">Silver Tier</div>
                  </div>
                  <Progress value={75} className="mt-4 h-2" />
                  <p className="text-sm text-gray-500 mt-2">150 points to Gold Tier</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Access key features</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="flex flex-col items-center h-24">
                    <Scan className="h-6 w-6 mb-2 text-purple-600" />
                    <span>Scan Product</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center h-24">
                    <ShoppingBasket className="h-6 w-6 mb-2 text-purple-600" />
                    <span>My Stores</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center h-24">
                    <History className="h-6 w-6 mb-2 text-purple-600" />
                    <span>History</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center h-24">
                    <Settings className="h-6 w-6 mb-2 text-purple-600" />
                    <span>Settings</span>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Middle Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Expiring Soon Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-purple-600" />
                    Products Expiring Soon
                  </CardTitle>
                  <CardDescription>Items that will expire in the next 10 days</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {expiringSoon.map((item) => (
                        <div key={item.id} className="flex items-center p-3 border rounded-lg hover:bg-purple-50 transition-colors">
                          <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center mr-4">
                            <img src={item.image} alt={item.name} className="w-10 h-10 object-contain" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-gray-500">Expires in {item.daysLeft} days</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{item.expiryDate}</p>
                            <Button variant="link" className="text-purple-600 h-auto p-0">
                              View details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Purchase History Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <History className="h-5 w-5 mr-2 text-purple-600" />
                    Purchase History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="purchases">Recent</TabsTrigger>
                      <TabsTrigger value="favorites">Favorites</TabsTrigger>
                      <TabsTrigger value="stores">By Store</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="purchases" className="mt-4">
                      {loading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {recentPurchases.map((purchase) => (
                            <div key={purchase.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-purple-50 transition-colors">
                              <div>
                                <h3 className="font-medium">{purchase.store}</h3>
                                <p className="text-sm text-gray-500">{purchase.date}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">${purchase.amount.toFixed(2)}</p>
                                <p className="text-sm text-gray-500">{purchase.items} items</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="favorites">
                      <div className="text-center py-8 text-gray-500">
                        Your favorite purchases will appear here
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="stores">
                      <div className="text-center py-8 text-gray-500">
                        Purchases grouped by store will appear here
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Dashboard Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">© 2023 INNOVAID Customer Dashboard</p>
          <Button variant="ghost" className="text-gray-600 hover:text-purple-600">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </footer>
    </div>
  );
}