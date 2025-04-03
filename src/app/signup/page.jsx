"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function SignupPage() {
  const [role, setRole] = useState(""); // "customer" or "admin"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-yellow-200 p-6"
    >
      <motion.h2 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-3xl font-bold mb-6 text-gray-800"
      >
        Register As
      </motion.h2>
      
      <div className="flex space-x-4 mb-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            role === "customer" 
              ? "bg-indigo-600 text-white shadow-md" 
              : "bg-white text-gray-700 shadow-sm hover:bg-gray-50"
          }`}
          onClick={() => setRole("customer")}
        >
          Customer
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            role === "admin" 
              ? "bg-teal-600 text-white shadow-md" 
              : "bg-white text-gray-700 shadow-sm hover:bg-gray-50"
          }`}
          onClick={() => setRole("admin")}
        >
          Administrator
        </motion.button>
      </div>

      {role && (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
        >
          <div className="mb-6">
            <label className="block mb-2 text-gray-700 font-medium">
              {role === "customer" ? "Full Name" : "Shop Name"}:
            </label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-gray-700 font-medium">Email:</label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-gray-700 font-medium">Password:</label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-8">
            <label className="block mb-2 text-gray-700 font-medium">Confirm Password:</label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 rounded-lg font-medium text-white shadow-md ${
              role === "customer" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-teal-600 hover:bg-teal-700"
            }`}
          >
            Sign Up
          </motion.button>
        </motion.form>
      )}
    </motion.div>
  );
}
