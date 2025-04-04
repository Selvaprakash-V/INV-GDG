'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, AlertCircle, DollarSign, FileText, ShoppingCart, Shield } from 'lucide-react';

export default function ExploreSeller() {
  const features = [
    {
      icon: <BarChart className="w-8 h-8 text-purple-600" />,
      title: "Expiry Analytics",
      description: "Track product expiry trends and reduce wastage",
      highlight: true
    },
    {
      icon: <AlertCircle className="w-8 h-8 text-purple-600" />,
      title: "Smart Alerts",
      description: "Get notified for low stock and expiring products",
      highlight: false
    },
    {
      icon: <DollarSign className="w-8 h-8 text-purple-600" />,
      title: "Profit Optimization",
      description: "Maximize revenue with sales trend insights",
      highlight: true
    },
    {
      icon: <FileText className="w-8 h-8 text-purple-600" />,
      title: "Detailed Reports",
      description: "Generate comprehensive business reports",
      highlight: false
    },
    {
      icon: <ShoppingCart className="w-8 h-8 text-purple-600" />,
      title: "Inventory Management",
      description: "Streamline your stock control processes",
      highlight: false
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-600" />,
      title: "Data Security",
      description: "Enterprise-grade protection for your business data",
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/90 shadow-md backdrop-blur-sm">
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

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <Button variant="ghost" className="text-gray-800 hover:text-purple-600">
                Back to Home
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-16 px-4 container mx-auto">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Seller <span className="text-purple-600">Features</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful tools to optimize your supermarket operations
          </p>
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className={`h-full bg-white border border-gray-200 hover:border-purple-300 transition-all duration-300 shadow-sm hover:shadow-md ${feature.highlight ? 'ring-2 ring-purple-300' : ''}`}>
                <CardHeader className="items-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="p-4 bg-purple-50 rounded-full"
                  >
                    {feature.icon}
                  </motion.div>
                  <CardTitle className="text-xl text-gray-800 mt-4">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-4 mt-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/administratorsignup">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg">
                  Register Your Store
                </Button>
              </motion.div>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link href="/demo-request">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-6 text-center border-t border-gray-200">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-medium text-gray-600"
        >
          © 2025 INNOVAID. All Rights Reserved.
        </motion.p>
      </footer>
    </div>
  );
}