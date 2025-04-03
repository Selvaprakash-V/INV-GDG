"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Home() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Navbar */}
      <header className="fixed w-full bg-opacity-90 backdrop-blur-lg p-4 shadow-lg border-b border-gray-700 z-50 flex justify-between items-center px-6">
        <h1 className="text-xl font-bold text-yellow-400">INNOVAID</h1>
        <nav>
          <ul className="flex space-x-6">
            <li className="hover:text-yellow-400 transition-colors cursor-pointer">Home</li>
            <li className="hover:text-yellow-400 transition-colors cursor-pointer">About</li>
            <li className="hover:text-yellow-400 transition-colors cursor-pointer">Contact</li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center h-screen text-center px-4">
        <motion.h2 initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="text-5xl font-bold text-yellow-400">
          Smart Expiry Tracking for a Better Future
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }} className="mt-4 text-gray-300 max-w-xl">
          Reduce waste and track expiry dates seamlessly with INNOVAID's AI-powered system.
        </motion.p>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <h3 className="text-3xl font-semibold text-center text-yellow-400 mb-12">Why Choose INNOVAID?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { title: "AI-Powered Expiry Alerts", desc: "Get notified before your products expire, reducing waste effectively." },
            { title: "Smart Inventory Management", desc: "Track and analyze stock levels with real-time insights." },
            { title: "Consumer-Friendly App", desc: "Easily check expiry dates for recently purchased products." },
          ].map((feature, index) => (
            <motion.div key={index} whileHover={{ scale: 1.1 }} className="p-8 bg-gray-900 rounded-xl shadow-lg text-center transition-all">
              <h4 className="text-2xl font-bold text-yellow-400">{feature.title}</h4>
              <p className="text-gray-300 mt-3">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-gray-800">
        <h3 className="text-3xl font-semibold text-center text-yellow-400 mb-12">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { title: "Step 1: Scan", desc: "Supermarkets scan product batches to register expiry dates." },
            { title: "Step 2: Monitor", desc: "INNOVAID tracks expiry dates and alerts sellers & consumers." },
            { title: "Step 3: Save", desc: "Enjoy fresh products while reducing unnecessary waste." },
          ].map((step, index) => (
            <motion.div key={index} whileHover={{ scale: 1.1 }} className="p-8 bg-gray-900 rounded-xl shadow-lg text-center transition-all">
              <h4 className="text-2xl font-bold text-yellow-400">{step.title}</h4>
              <p className="text-gray-300 mt-3">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}