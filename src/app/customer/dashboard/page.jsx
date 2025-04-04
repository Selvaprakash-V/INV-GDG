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
  name: "Priya",
  email: "priya.patel@example.com",
  avatar: "/avatars/02.png",
};

const monthlySpending = [
  { month: "Jan", amount: 14200 },
  { month: "Feb", amount: 15600 },
  { month: "Mar", amount: 18900 },
  { month: "Apr", amount: 13200 },
  { month: "May", amount: 11500 },
  { month: "Jun", amount: 10500 },
];

const weeklySpending = [
  { week: "Week 1", amount: 3800 },
  { week: "Week 2", amount: 4200 },
  { week: "Week 3", amount: 3950 },
  { week: "Week 4", amount: 4750 },
];

const recentPurchases = [
  {
    id: "INV-2025-0078",
    date: "2025-03-18",
    store: "FreshMart Andheri",
    total: 1875,
    items: [
      { name: "Amul Butter (500g)", price: 240, expiryDate: "2025-04-26", quantity: 1 },
      { name: "Britannia Cake", price: 90, expiryDate: "2025-04-02", quantity: 2 },
      { name: "Hershey's Syrup", price: 180, expiryDate: "2025-05-04", quantity: 1 },
    ]
  },
  {
    id: "INV-2025-0077",
    date: "2025-03-02", 
    store: "Nature's Basket Bandra",
    total: 2250,
    items: [
      { name: "Organic Strawberries", price: 350, expiryDate: "2025-04-10", quantity: 1 },
      { name: "Almond Milk", price: 120, expiryDate: "2025-04-06", quantity: 2 }
    ]
  },
  {
    id: "INV-2025-0076",
    date: "2025-02-27",
    store: "DMart Malad",
    total: 3100,
    items: [
      { name: "Fortune Oil (5L)", price: 750, expiryDate: "2025-05-20", quantity: 1 },
      { name: "Aashirvaad Atta (10kg)", price: 450, expiryDate: "2025-12-01", quantity: 1 }
    ]
  },
  {
    id: "INV-2025-0075",
    date: "2025-03-08",
    store: "FreshMart Andheri",
    total: 1420,
    items: [
      { name: "Yogurt", price: 60, expiryDate: "2025-05-15", quantity: 3 },
      { name: "Pasta Sauce", price: 120, expiryDate: "2025-06-30", quantity: 2 }
    ]
  },
  {
    id: "INV-2025-0074",
    date: "2025-03-05",
    store: "Nature's Basket Bandra",
    total: 1850,
    items: [
      { name: "Avocados", price: 200, expiryDate: "2025-06-10", quantity: 2 },
      { name: "Quinoa", price: 350, expiryDate: "2025-07-28", quantity: 1 }
    ]
  },
  {
    id: "INV-2025-0073",
    date: "2025-02-27",
    store: "DMart Malad",
    total: 2750,
    items: [
      { name: "Toor Dal (5kg)", price: 450, expiryDate: "2026-06-15", quantity: 1 },
      { name: "Sugar (5kg)", price: 220, expiryDate: "2026-03-20", quantity: 1 }
    ]
  }
];

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [expiringSoon, setExpiringSoon] = useState([]);
  const [stores, setStores] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(25000);
  const [weeklyBudget, setWeeklyBudget] = useState(7500);
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

    // Extract unique stores with purchase stats
    const storeMap = {};
    recentPurchases.forEach(purchase => {
      if (!storeMap[purchase.store]) {
        storeMap[purchase.store] = {
          name: purchase.store,
          visitCount: 0,
          totalSpent: 0,
          lastVisit: new Date(0),
          purchases: []
        };
      }
      storeMap[purchase.store].visitCount++;
      storeMap[purchase.store].totalSpent += purchase.total;
      const purchaseDate = new Date(purchase.date);
      if (purchaseDate > storeMap[purchase.store].lastVisit) {
        storeMap[purchase.store].lastVisit = purchaseDate;
      }
      storeMap[purchase.store].purchases.push(purchase);
    });
    setStores(Object.values(storeMap));
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
            <DashboardTab 
              userData={userData}
              currentMonthSpending={currentMonthSpending}
              monthlyChange={monthlyChange}
              monthlyBudget={monthlyBudget}
              currentWeekSpending={currentWeekSpending}
              weeklyChange={weeklyChange}
              weeklyBudget={weeklyBudget}
              recentPurchases={recentPurchases}
              expiringSoon={expiringSoon}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "history" && (
            <HistoryTab recentPurchases={recentPurchases} />
          )}

          {activeTab === "alerts" && (
            <AlertsTab expiringSoon={expiringSoon} recentPurchases={recentPurchases} />
          )}

          {activeTab === "stores" && (
            <StoresTab stores={stores} />
          )}

          {activeTab === "budget" && (
            <BudgetTab 
              monthlyBudget={monthlyBudget}
              weeklyBudget={weeklyBudget}
              currentMonthSpending={currentMonthSpending}
              currentWeekSpending={currentWeekSpending}
              isEditingBudget={isEditingBudget}
              setIsEditingBudget={setIsEditingBudget}
              setMonthlyBudget={setMonthlyBudget}
              setWeeklyBudget={setWeeklyBudget}
              handleSaveBudget={handleSaveBudget}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Dashboard Tab Component
function DashboardTab({
  userData,
  currentMonthSpending,
  monthlyChange,
  monthlyBudget,
  currentWeekSpending,
  weeklyChange,
  weeklyBudget,
  recentPurchases,
  expiringSoon,
  setActiveTab
}) {
  return (
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
  );
}

// Purchase History Tab Component
function HistoryTab({ recentPurchases }) {
  return (
    <motion.div
      key="history"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900">Purchase History</h1>
        <p className="text-lg text-gray-600">All your recent transactions</p>
      </motion.div>

      <div className="space-y-6">
        {recentPurchases.map((purchase) => (
          <motion.div
            key={purchase.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white border rounded-lg p-5 hover:shadow-md transition-shadow"
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
                    <div className="text-sm text-gray-500">
                      Expires: {new Date(item.expiryDate).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Expiry Alerts Tab Component
function AlertsTab({ expiringSoon, recentPurchases }) {
  return (
    <motion.div
      key="alerts"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900">Expiry Alerts</h1>
        <p className="text-lg text-gray-600">Products expiring soon from your purchases</p>
      </motion.div>

      {expiringSoon.length > 0 ? (
        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {expiringSoon.map((item) => {
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
                        Purchased on {new Date(purchase.date).toLocaleDateString('en-IN')} from {purchase.store}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="destructive" className="flex items-center gap-2 text-lg">
                        <CalendarClock className="h-4 w-4" />
                        {diffDays} day{diffDays !== 1 ? 's' : ''} left
                      </Badge>
                      <div className="text-lg font-medium">
                        ₹{item.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-xl font-medium">No expiring products</h3>
            <p className="mt-2 text-gray-500 text-lg">You currently have no products that are about to expire</p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

// My Stores Tab Component
function StoresTab({ stores }) {
  return (
    <motion.div
      key="stores"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900">My Stores</h1>
        <p className="text-lg text-gray-600">Your favorite shopping destinations</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store, index) => (
          <motion.div
            key={store.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-white border-0 shadow-lg h-full">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                    <Store className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{store.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-base">
                    <span className="text-gray-500">Total Visits:</span>
                    <span className="font-medium">
                      {store.visitCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-500">Last Visit:</span>
                    <span className="font-medium">
                      {store.lastVisit.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-gray-500">Total Spent:</span>
                    <span className="font-medium">
                      ₹{store.totalSpent.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full text-lg h-12">
                  View Purchases
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Budget Tab Component
function BudgetTab({
  monthlyBudget,
  weeklyBudget,
  currentMonthSpending,
  currentWeekSpending,
  isEditingBudget,
  setIsEditingBudget,
  setMonthlyBudget,
  setWeeklyBudget,
  handleSaveBudget
}) {
  return (
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
  );
}