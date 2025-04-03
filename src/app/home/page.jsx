'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-800 via-gray-900 to-black text-white font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-5 bg-gray-800 shadow-lg fixed w-full top-0 z-50">
        <h1 className="text-2xl font-bold text-orange-500">INNOVAID</h1>
        <div className="space-x-6">
          {['About', 'Contact', 'Login'].map((item) => (
            <Link key={item} href={`/${item.toLowerCase()}`}>
              <span className="cursor-pointer hover:text-orange-400 transition duration-300">{item}</span>
            </Link>
          ))}
        </div>
      </nav>
      
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center py-32 px-6">
        <motion.h2 
          className="text-5xl font-extrabold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Track Expiry, Minimize Waste, Maximize Awareness
        </motion.h2>
        <p className="text-lg text-gray-300 mt-4 max-w-2xl">
          INNOVAID helps you track expiry dates smartly, reducing waste and increasing awareness.
        </p>
        <motion.div whileHover={{ scale: 1.1 }}>
          <Button className="mt-6 px-6 py-3 bg-orange-500 rounded-full text-lg font-semibold hover:bg-orange-600 transition duration-300">
            Get Started
          </Button>
        </motion.div>
      </div>

      {/* Get Started Section */}
      <section className="text-center py-16 bg-gray-800">
        <h3 className="text-3xl font-semibold text-orange-400">Start Using INNOVAID Today!</h3>
        <p className="text-gray-300 mt-2">Join us and simplify inventory management with our smart expiry tracking solutions.</p>
        <motion.div whileHover={{ scale: 1.1 }}>
          <Button className="mt-6 px-6 py-3 bg-orange-500 rounded-full text-lg font-semibold hover:bg-orange-600 transition duration-300">
            Get Started
          </Button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="text-center py-16 bg-gray-900">
        <h3 className="text-3xl font-semibold text-orange-400">Smart Expiry Solutions</h3>
        <p className="text-gray-300 mt-2">INNOVAID offers smart expiry tracking, inventory alerts, and QR-based tracking.</p>
        <div className="flex flex-col md:flex-row justify-center mt-8 space-y-4 md:space-y-0 md:space-x-6">
          {[{ title: 'Seller Portal', desc: 'Track expiry trends, inventory alerts, and maximize profits.', button: 'Explore Now' },
            { title: 'Consumer Portal', desc: 'QR Tracking & Expiry Alerts.', button: 'View More' }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              className="w-72 cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <Card className="bg-gray-700 shadow-lg hover:shadow-xl">
                <CardContent className="p-6 text-center">
                  <h4 className="text-xl font-semibold text-orange-400">{feature.title}</h4>
                  <p className="text-gray-300 mt-2">{feature.desc}</p>
                  <motion.div whileHover={{ scale: 1.1 }}>
                    <Button className="mt-4 px-4 py-2 bg-orange-500 rounded-full text-lg font-semibold hover:bg-orange-600 transition duration-300">
                      {feature.button}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 text-center text-gray-400">
        <p className="text-lg font-semibold text-orange-400">Get In Touch</p>
        <p className="mt-2">📧 info@innovaid.com | 📞 +1-555-123-4567 | 📍 123 Main St, Anytown, 12345</p>
        <p className="mt-4 text-sm">© 2025 INNOVAID. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
