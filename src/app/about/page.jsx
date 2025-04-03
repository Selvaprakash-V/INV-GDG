'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { useEffect } from 'react';

export default function AboutPage() {
  const features = [
    {
      title: "For Supermarkets",
      description: "Powerful inventory management tools for retailers",
      items: [
        "Real-time stock tracking",
        "Predictive analytics for demand",
        "Automated expiry alerts",
        "Sales trend visualization"
      ],
      icon: "🏪"
    },
    {
      title: "For Consumers",
      description: "Smart shopping experience for customers",
      items: [
        "Purchase history tracking",
        "Expiry date notifications",
        "Affiliated store locator",
        "Personalized recommendations"
      ],
      icon: "🛒"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100 text-gray-800">
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
            <Link href="/about">
              <Button variant="ghost" className="text-gray-800 hover:text-purple-600">
                About
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" className="text-gray-800 hover:text-purple-600">
                Contact
              </Button>
            </Link>
            <Link href="/">
              <Button className="bg-purple-600 text-white hover:bg-purple-700">
                Back to Home
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-16 px-4 container mx-auto">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About <span className="text-purple-600">INNOVAID</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Revolutionizing inventory management with smart expiry tracking for both supermarkets and consumers.
          </p>
        </motion.section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full bg-white border border-gray-200 hover:border-purple-300 transition-all duration-300 shadow-sm hover:shadow-md">
                <CardHeader>
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <CardTitle className="text-2xl text-gray-800">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.items.map((item, i) => (
                      <motion.li 
                        key={i}
                        className="flex items-start text-gray-700"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + (i * 0.1) }}
                      >
                        <span className="text-purple-500 mr-2">✓</span>
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </section>

        {/* Mission Statement */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 bg-white/80 backdrop-blur-sm p-8 rounded-xl border border-gray-200 shadow-sm max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Our Mission</h2>
          <p className="text-gray-600 text-center">
            To reduce food waste by 30% globally through innovative expiry tracking technology,
            creating value for both retailers and consumers while promoting sustainable consumption.
          </p>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="bg-white py-6 text-center border-t border-gray-200">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="font-medium text-gray-600"
        >
          © 2025 INNOVAID. All Rights Reserved.
        </motion.p>
      </footer>
    </div>
  );
}