"use client";
import { useState } from "react";

export default function SignupPage() {
  const [role, setRole] = useState(""); // "customer" or "admin"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-4">Register As</h2>
      
      <div className="flex space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${role === "customer" ? "bg-blue-600 text-white" : "bg-gray-300"}`}
          onClick={() => setRole("customer")}
        >
          Customer
        </button>
        <button
          className={`px-4 py-2 rounded ${role === "admin" ? "bg-blue-600 text-white" : "bg-gray-300"}`}
          onClick={() => setRole("admin")}
        >
          Administrator
        </button>
      </div>

      {role && (
        <form className="bg-white p-6 rounded shadow-md w-96">
          <label className="block mb-2 text-gray-700 font-medium">
            {role === "customer" ? "Full Name" : "Shop Name"}:
          </label>
          <input
            type="text"
            className="w-full p-2 mb-4 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label className="block mb-2 text-gray-700 font-medium">Email:</label>
          <input
            type="email"
            className="w-full p-2 mb-4 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="block mb-2 text-gray-700 font-medium">Password:</label>
          <input
            type="password"
            className="w-full p-2 mb-4 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label className="block mb-2 text-gray-700 font-medium">Confirm Password:</label>
          <input
            type="password"
            className="w-full p-2 mb-4 border rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button className="w-full bg-blue-600 text-white p-2 rounded mt-4">
            Sign Up
          </button>
        </form>
      )}
    </div>
  );
}
