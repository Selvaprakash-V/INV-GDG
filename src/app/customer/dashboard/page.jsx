"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { 
  Home, 
  ShoppingBag, 
  AlertTriangle, 
  History,
  Store,
  IndianRupee,
  CalendarClock,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Wallet,
  Settings
} from "lucide-react";

// Sample data
const userData = {
  name: "Rahul Sharma",
  email: "rahul.sharma@example.com",
  avatar: "/avatars/01.png",
};

const monthlySpending = [
  { month: "Jan", amount: 12500 },
  { month: "Feb", amount: 14200 },
  { month: "Mar", amount: 16350 },
  { month: "Apr", amount: 11800 },
  { month: "May", amount: 9800 },
  { month: "Jun", amount: 15700 },
];

const weeklySpending = [
  { week: "Week 1", amount: 3200 },
  { week: "Week 2", amount: 2850 },
  { week: "Week 3", amount: 4100 },
  { week: "Week 4", amount: 3750 },
];

const recentPurchases = [
  {
    id: "INV-2023-0065",
    date: "2023-06-15",
    store: "FreshMart Koramangala",
    total: 1425,
    items: [
      { name: "Amul Milk (1L)", price: 58, expiryDate: "2023-06-18", quantity: 2 },
      { name: "Britannia Bread", price: 35, expiryDate: "2023-06-22", quantity: 1 },
      { name: "Dairy Milk Chocolate", price: 50, expiryDate: "2023-08-15", quantity: 3 },
    ]
  },
  {
    id: "INV-2023-0064",
    date: "2023-06-10",
    store: "Nature's Basket Indiranagar", 
    total: 890,
    items: [
      { name: "Organic Apples", price: 120, expiryDate: "2023-06-12", quantity: 2 },
      { name: "Organic Bananas", price: 45, expiryDate: "2023-06-08", quantity: 3 }
    ]
  },
  {
    id: "INV-2023-0063",
    date: "2023-06-05",
    store: "DMart HSR Layout",
    total: 2150,
    items: [
      { name: "Basmati Rice (5kg)", price: 450, expiryDate: "2024-01-15", quantity: 1 },
      { name: "Fortune Oil (1L)", price: 180, expiryDate: "2024-03-20", quantity: 1 },
    ]
  }
];

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [expiringSoon, setExpiringSoon] = useState([]);
  const [stores, setStores] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(20000);
  const [weeklyBudget, setWeeklyBudget] = useState(5000);
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  // Calculate spending data
  const currentMonthSpending = monthlySpending[monthlySpending.length - 1].amount;
  const monthlyChange = ((currentMonthSpending - monthlySpending[monthlySpending.length - 2].amount) / 
                       monthlySpending[monthlySpending.length - 2].amount * 100);

  const currentWeekSpending = weeklySpending[weeklySpending.length - 1].amount;
  const weeklyChange = ((currentWeekSpending - weeklySpending[weeklySpending.length - 2].amount) / 
                       weeklySpending[weeklySpending.length - 2].amount * 100);

  // Process data on component mount
  useEffect(() => {
    // Find expiring products (within 7 days)
    const expiring = recentPurchases.flatMap(purchase => 
      purchase.items.filter(item => {
        const expiryDate = new Date(item.expiryDate);
        const today = new Date();
        const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 7;
      })
    );
    setExpiringSoon(expiring);

    // Extract unique stores
    const uniqueStores = [...new Set(recentPurchases.map(purchase => purchase.store))];
    setStores(uniqueStores);
  }, []);

  const handleSaveBudget = () => {
    setIsEditingBudget(false);
    // In a real app, you would save this to your database/backend here
  };

  const navItems = [
    { id: "dashboard", icon: <Home className="h-5 w-5" />, label: "Dashboard" },
    { id: "history", icon: <History className="h-5 w-5" />, label: "Purchase History" },
    { id: "alerts", icon: <AlertTriangle className="h-5 w-5" />, label: "Expiry Alerts" },
    { id: "stores", icon: <Store className="h-5 w-5" />, label: "My Stores" },
    { id: "budget", icon: <Wallet className="h-5 w-5" />, label: "Set Budget" }
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Sidebar Navigation */}
      <motion.div 
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="w-72 bg-white/90 backdrop-blur-sm shadow-lg flex flex-col border-r border-purple-100"
      >
        <div className="p-6 flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={userData.avatar} />
            <AvatarFallback className="text-lg">{userData.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-lg">{userData.name}</p>
            <p className="text-sm text-gray-500">Premium Member</p>
          </div>
        </div>

        <Separator />

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={activeTab === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start text-lg ${activeTab === item.id ? "bg-purple-50 text-purple-700" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
                {activeTab === item.id && (
                  <ChevronRight className="ml-auto h-5 w-5" />
                )}
              </Button>
            </motion.div>
          ))}
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Welcome Section */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl font-bold text-gray-900">Welcome back, {userData.name}!</h1>
                <p className="text-lg text-gray-600">Here's your shopping overview</p>
              </motion.div>

              {/* Spending Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card className="bg-white border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center text-2xl">
                        <IndianRupee className="mr-3 h-6 w-6" />
                        Monthly Spending
                      </CardTitle>
                      <CardDescription className="text-lg">Total purchases this month</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold">₹{currentMonthSpending.toLocaleString('en-IN')}</div>
                      <div className={cn(
                        "flex items-center mt-3 text-lg",
                        monthlyChange >= 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {monthlyChange >= 0 ? (
                          <ArrowUp className="h-5 w-5 mr-2" />
                        ) : (
                          <ArrowDown className="h-5 w-5 mr-2" />
                        )}
                        {Math.abs(monthlyChange).toFixed(1)}% from last month
                      </div>
                      <div className="mt-6">
                        <Progress value={(currentMonthSpending / monthlyBudget) * 100} className="h-3" />
                        <div className="flex justify-between mt-2">
                          <p className="text-sm text-gray-500">₹0</p>
                          <p className="text-sm text-gray-500">₹{monthlyBudget.toLocaleString('en-IN')} budget</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="bg-white border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center text-2xl">
                        <ShoppingBag className="mr-3 h-6 w-6" />
                        Weekly Spending
                      </CardTitle>
                      <CardDescription className="text-lg">Total purchases this week</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold">₹{currentWeekSpending.toLocaleString('en-IN')}</div>
                      <div className={cn(
                        "flex items-center mt-3 text-lg",
                        weeklyChange >= 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {weeklyChange >= 0 ? (
                          <ArrowUp className="h-5 w-5 mr-2" />
                        ) : (
                          <ArrowDown className="h-5 w-5 mr-2" />
                        )}
                        {Math.abs(weeklyChange).toFixed(1)}% from last week
                      </div>
                      <div className="mt-6">
                        <Progress value={(currentWeekSpending / weeklyBudget) * 100} className="h-3" />
                        <div className="flex justify-between mt-2">
                          <p className="text-sm text-gray-500">₹0</p>
                          <p className="text-sm text-gray-500">₹{weeklyBudget.toLocaleString('en-IN')} budget</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Recent Purchases */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="bg-white border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                      <History className="mr-3 h-6 w-6" />
                      Recent Purchases
                    </CardTitle>
                    <CardDescription className="text-lg">Your most recent transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {recentPurchases.slice(0, 2).map((purchase) => (
                        <motion.div
                          key={purchase.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border rounded-lg p-5 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-lg">Invoice #{purchase.id}</h3>
                              <p className="text-gray-500 text-base">
                                {new Date(purchase.date).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })} • {purchase.store}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-lg">
                              ₹{purchase.total.toLocaleString('en-IN')}
                            </Badge>
                          </div>

                          <Separator className="my-4" />

                          <div className="space-y-3">
                            {purchase.items.map((item) => (
                              <div key={item.name} className="flex justify-between text-base">
                                <div>
                                  <span className="font-medium">{item.name}</span>
                                  <span className="text-gray-500 ml-3">x{item.quantity}</span>
                                </div>
                                <div className="text-right">
                                  <div>₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="justify-center border-t pt-6">
                    <Button 
                      variant="ghost" 
                      className="text-purple-600 text-lg"
                      onClick={() => setActiveTab("history")}
                    >
                      View All Purchases
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>

              {/* Expiry Alerts Preview */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="bg-white border-0 shadow-lg border-orange-100">
                  <CardHeader className="bg-orange-50/50 rounded-t-lg">
                    <CardTitle className="flex items-center text-2xl text-orange-600">
                      <AlertTriangle className="mr-3 h-6 w-6" />
                      Expiry Alerts
                    </CardTitle>
                    <CardDescription className="text-lg">Items expiring soon from your purchases</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-orange-50/50">
                      {expiringSoon.slice(0, 4).map((item) => {
                        const expiryDate = new Date(item.expiryDate);
                        const today = new Date();
                        const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        const purchase = recentPurchases.find(p => 
                          p.items.some(i => i.name === item.name));

                        return (
                          <motion.div
                            key={`${item.name}-${expiryDate}`}
                            whileHover={{ scale: 1.01 }}
                            className="p-5 flex justify-between items-center"
                          >
                            <div>
                              <h4 className="font-medium text-lg">{item.name}</h4>
                              <p className="text-gray-600 text-base">
                                Purchased from {purchase.store}
                              </p>
                            </div>
                            <Badge variant="destructive" className="flex items-center gap-2 text-lg">
                              <CalendarClock className="h-4 w-4" />
                              {diffDays} day{diffDays !== 1 ? 's' : ''} left
                            </Badge>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                  <CardFooter className="justify-center border-t border-orange-100 pt-6">
                    <Button 
                      variant="ghost" 
                      className="text-orange-600 text-lg"
                      onClick={() => setActiveTab("alerts")}
                    >
                      View All Alerts
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {activeTab === "budget" && (
            <motion.div
              key="budget"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <h1 className="text-4xl font-bold text-gray-900">Set Your Budget</h1>
                <p className="text-lg text-gray-600">Manage your monthly and weekly spending limits</p>
              </motion.div>

              <Card className="bg-white border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Budget Settings</CardTitle>
                  <CardDescription className="text-lg">
                    Set limits to help manage your grocery spending
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label htmlFor="monthlyBudget" className="text-lg font-medium">
                        Monthly Budget
                      </label>
                      {isEditingBudget ? (
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-lg">₹</span>
                          <Input
                            id="monthlyBudget"
                            type="number"
                            value={monthlyBudget}
                            onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                            className="pl-8 text-lg h-12"
                          />
                        </div>
                      ) : (
                        <div className="text-2xl font-bold">₹{monthlyBudget.toLocaleString('en-IN')}</div>
                      )}
                    </div>
                    <Progress 
                      value={(currentMonthSpending / monthlyBudget) * 100} 
                      className="h-3" 
                    />
                    <div className="flex justify-between mt-2">
                      <p className="text-sm text-gray-500">₹0</p>
                      <p className="text-sm text-gray-500">₹{monthlyBudget.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label htmlFor="weeklyBudget" className="text-lg font-medium">
                        Weekly Budget
                      </label>
                      {isEditingBudget ? (
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-lg">₹</span>
                          <Input
                            id="weeklyBudget"
                            type="number"
                            value={weeklyBudget}
                            onChange={(e) => setWeeklyBudget(Number(e.target.value))}
                            className="pl-8 text-lg h-12"
                          />
                        </div>
                      ) : (
                        <div className="text-2xl font-bold">₹{weeklyBudget.toLocaleString('en-IN')}</div>
                      )}
                    </div>
                    <Progress 
                      value={(currentWeekSpending / weeklyBudget) * 100} 
                      className="h-3" 
                    />
                    <div className="flex justify-between mt-2">
                      <p className="text-sm text-gray-500">₹0</p>
                      <p className="text-sm text-gray-500">₹{weeklyBudget.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end gap-4">
                  {isEditingBudget ? (
                    <>
                      <Button 
                        variant="outline" 
                        className="text-lg h-12 px-6"
                        onClick={() => setIsEditingBudget(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        className="text-lg h-12 px-6"
                        onClick={handleSaveBudget}
                      >
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button 
                      className="text-lg h-12 px-6"
                      onClick={() => setIsEditingBudget(true)}
                    >
                      <Settings className="mr-2 h-5 w-5" />
                      Edit Budget
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {/* Other tabs (history, alerts, stores) remain the same as previous implementation */}
          {/* ... */}
        </AnimatePresence>
      </div>
    </div>
  );
}