"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function HomePage() {
  const [circles, setCircles] = useState([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    setReducedMotion(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    try {
      const generatedCircles = Array.from({ length: reducedMotion ? 5 : 10 }).map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        backgroundColor: `hsl(${Math.random() * 360}, 100%, 75%)`,
        duration: Math.random() * 3 + 2,
        size: Math.random() * 40 + 20,
      }));
      setCircles(generatedCircles);
    } catch (error) {
      console.error("Error generating circles:", error);
      // Fallback static circles if generation fails
      setCircles([
        { top: '20%', left: '10%', backgroundColor: 'hsl(120, 100%, 75%)', duration: 3, size: 30 },
        { top: '70%', left: '80%', backgroundColor: 'hsl(240, 100%, 75%)', duration: 4, size: 40 }
      ]);
    }
  }, [reducedMotion]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      {/* Floating Colorful Circles */}
      <div className="absolute inset-0">
        {circles.map((circle, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-50"
            style={{
              top: circle.top,
              left: circle.left,
              backgroundColor: circle.backgroundColor,
              width: `${circle.size}px`,
              height: `${circle.size}px`,
            }}
            initial={{ opacity: 0 }}
            animate={
              reducedMotion
                ? { opacity: 0.5 }
                : {
                    y: [0, 30, -30, 0],
                    x: [0, 20, -20, 0],
                    opacity: 0.5,
                  }
            }
            transition={{
              duration: circle.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative flex flex-col items-center justify-center h-full text-white text-center px-4">
        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Welcome to Our Inventory System!
        </motion.h1>

        <motion.p
          className="mt-2 text-lg md:text-xl opacity-80 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
        >
          Manage your products with ease and efficiency.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.6 }}
        >
          <Link href="/signup" passHref legacyBehavior>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white text-purple-700 font-semibold rounded-lg shadow-md cursor-pointer block text-center"
            >
              Get Started
            </motion.a>
          </Link>

          <Link href="/dashboard" passHref legacyBehavior>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md cursor-pointer block text-center"
            >
              Dashboard
            </motion.a>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}