'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScanSearch, BellRing, Package, Store, Lightbulb, Shield } from 'lucide-react';

export default function ExploreCustomer() {
  const features = [
    {
      icon: <BellRing className="w-8 h-8 text-purple-600" />,
      title: "Expiry Alerts",
      description: "Get notified when your purchased items are nearing expiry",
      badge: "New"
    },
    {
      icon: <ScanSearch className="w-8 h-8 text-purple-600" />,
      title: "QR Tracking",
      description: "Scan QR codes to instantly access product information",
      badge: "Popular"
    },
    {
      icon: <Package className="w-8 h-8 text-purple-600" />,
      title: "Purchase History",
      description: "View detailed records of all your past purchases",
      badge: null
    },
    {
      icon: <Store className="w-8 h-8 text-purple-600" />,
      title: "Store Locator",
      description: "Find affiliated supermarkets near you",
      badge: null
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-purple-600" />,
      title: "Smart Suggestions",
      description: "Receive personalized recommendations based on your habits",
      badge: "AI-Powered"
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-600" />,
      title: "Account Security",
      description: "Advanced protection for all your personal data",
      badge: null
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
  <h1 className="text-3xl font-extrabold tracking-wide hover:scale-105 transition-transform duration-300">
    <span className="text-purple-600">TRAC</span><span className="text-pink-600">KIT</span>
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
            Customer <span className="text-purple-600">Features</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how INNOVAID enhances your shopping experience
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
              <Card className="h-full bg-white border border-gray-200 hover:border-purple-300 transition-all duration-300 shadow-sm hover:shadow-md">
                <CardHeader className="items-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="p-4 bg-purple-50 rounded-full"
                  >
                    {feature.icon}
                  </motion.div>
                  <CardTitle className="text-xl text-gray-800 mt-4 flex items-center justify-center gap-2">
                    {feature.title}
                    {feature.badge && (
                      <Badge variant="outline" className="border-purple-300 text-purple-600">
                        {feature.badge}
                      </Badge>
                    )}
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center mt-12"
        >
          <Link href="/customersignup">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg">
                Get Started as Customer
              </Button>
            </motion.div>
          </Link>
        </motion.div>
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