"use client";  // Add this line at the top

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function HomePage() {
  const [circles, setCircles] = useState([]);

  useEffect(() => {
    const generatedCircles = [...Array(10)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      backgroundColor: `hsl(${Math.random() * 360}, 100%, 75%)`,
      duration: Math.random() * 3 + 2,
    }));
    setCircles(generatedCircles);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      {/* Floating Colorful Circles */}
      <div className="absolute inset-0">
        {circles.map((circle, i) => (
          <motion.div
            key={i}
            className="absolute w-24 h-24 rounded-full opacity-50"
            style={{
              top: circle.top,
              left: circle.left,
              backgroundColor: circle.backgroundColor,
            }}
            animate={{
              y: [0, 30, -30, 0],
              x: [0, 20, -20, 0],
            }}
            transition={{
              duration: circle.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative flex flex-col items-center justify-center h-full text-white text-center">
        <motion.h1
          className="text-5xl font-bold"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Welcome to Our Inventory System!
        </motion.h1>

        <motion.p
          className="mt-4 text-lg opacity-80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          Manage your products with ease and efficiency.
        </motion.p>

        <motion.div
          className="mt-8 flex space-x-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
        >
          <Link href="/signup">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="px-6 py-3 bg-white text-purple-700 font-semibold rounded-lg shadow-md transition-all"
            >
              Get Started
            </motion.button>
          </Link>

          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-all"
            >
              Dashboard
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
