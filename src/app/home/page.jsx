'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const trustedBrands = [
    { name: 'Walmart', logo: '/brands/walmart.png' },
    { name: 'Kroger', logo: '/brands/kroger.png' },
    { name: 'Target', logo: '/brands/target.png' },
    { name: 'Aldi', logo: '/brands/aldi.png' },
    { name: 'Lidl', logo: '/brands/lidl.png' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-violet-100 to-purple-200 text-gray-800 font-sans">
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {['About', 'Contact', 'Login'].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={`/${item.toLowerCase()}`}
                  className={`text-lg font-medium transition duration-300 ${item === 'Login' ? '' : 'hover:text-purple-600'}`}
                >
                  {item === 'Login' ? (
                    <Button variant="outline" className="bg-purple-600 text-white hover:bg-purple-700 border-purple-600">
                      {item}
                    </Button>
                  ) : (
                    item
                  )}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-8 h-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </motion.button>
        </div>

        {/* Mobile Dropdown */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-sm overflow-hidden shadow-md"
          >
            <div className="flex flex-col space-y-2 p-4">
              {['Home', 'About', 'Contact', 'Login'].map((item) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link
                    href={`/${item.toLowerCase()}`}
                    className={`block py-2 transition duration-300 rounded px-4 ${item === 'Login' ? '' : 'hover:bg-purple-50'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item === 'Login' ? (
                      <span className="inline-block bg-purple-600 text-white px-4 py-2 rounded font-bold">
                        {item}
                      </span>
                    ) : (
                      item
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-100/20 via-transparent to-transparent -z-10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Track Expiry, Minimize Waste, Maximize Awareness
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            TRACKIT helps you track expiry dates smartly, reducing waste and increasing awareness.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/role">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 px-8 py-6 text-lg font-bold rounded-full shadow-lg shadow-purple-300">
                Get Started
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Solutions */}
      <section className="py-16 bg-gradient-to-b from-white to-purple-50 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl font-bold text-gray-800">Trusted by Leading Supermarkets & Brands Globally</h1>
            <br></br>
            <h2 className="text-3xl font-bold text-gray-800">Smart Expiry Solutions</h2>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              TRACKIT offers smart expiry tracking, inventory alerts, and QR-based tracking.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              {
                title: 'Shop Registration',
                description: 'Register your shop and manage inventory efficiently.',
                icon: '🏪'
              },
              {
                title: 'Expiry Trends',
                description: 'Optimize inventory with expiry trend tracking.',
                icon: '📊'
              }
            ].map((solution, index) => (
              <motion.div
                key={solution.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="bg-white border border-gray-200 hover:border-purple-300 transition-all duration-300 h-full shadow-sm hover:shadow-md">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{solution.icon}</div>
                    <h3 className="text-xl font-bold text-gray-800">{solution.title}</h3>
                    <p className="text-gray-600 mt-2">{solution.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portals */}
      <section className="py-16 bg-white/50 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8">
            {[
              {
                title: 'Seller Portal',
                description: 'Track expiry trends, inventory alerts, and maximize profits.',
                features: [],
                buttonText: 'Explore Now',
                href: '/exploreseller',
                gradient: 'from-purple-100 to-white'
              },
              {
                title: 'Consumer Portal',
                description: 'QR Tracking & Expiry Alerts.',
                features: ['✅ QR Tracking', '✅ Expiry Alerts'],
                buttonText: 'View More',
                href: '/explorecustomer',
                gradient: 'from-pink-100 to-white'
              }
            ].map((portal, index) => (
              <motion.div
                key={portal.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="w-full sm:w-80"
              >
                <Card className={`bg-gradient-to-b ${portal.gradient} border border-gray-200 h-full shadow-sm hover:shadow-md`}>
                  <CardHeader>
                    <CardTitle className="text-gray-800 text-2xl">{portal.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 mb-4">
                      {portal.description}
                    </CardDescription>
                    {portal.features.length > 0 && (
                      <ul className="space-y-2 mb-6 text-gray-700">
                        {portal.features.map((feature, i) => (
                          <li key={i}>{feature}</li>
                        ))}
                      </ul>
                    )}
                    <Link href={portal.href}>
                      <Button className="w-full bg-purple-600 text-white hover:bg-purple-700">
                        {portal.buttonText}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-gradient-to-b from-purple-50 to-white text-center relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Get In Touch</h2>
            <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8 text-lg text-gray-600">
              <motion.a
                href="mailto:info@TRACKIT.com"
                whileHover={{ scale: 1.05 }}
                className="flex items-center justify-center gap-2 hover:text-purple-600 transition-colors"
              >
                <span>📧</span> info@TRACKIT.com
              </motion.a>
              <motion.a
                href="tel:+15551234567"
                whileHover={{ scale: 1.05 }}
                className="flex items-center justify-center gap-2 hover:text-purple-600 transition-colors"
              >
                <span>📞</span> +1-555-123-4567
              </motion.a>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center justify-center gap-2 hover:text-purple-600 transition-colors"
              >
                <span>📍</span> 123 Main St, Anytown, 12345
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-6 text-center border-t border-gray-200">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="font-medium text-gray-600"
        >
          © 2025 TRACKIT. All Rights Reserved.
        </motion.p>
      </footer>
    </div>
  );
}