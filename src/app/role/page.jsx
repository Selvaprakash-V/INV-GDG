// src/app/role/page.jsx
"use client";

import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function RoleSelection() {
  useEffect(() => {
    // Add any client-side animation logic here if needed
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white relative">
      <Head>
        <title>Select Role - INNOVAID</title>
      </Head>

      <style jsx global>{`
        body {
          background: #0d0d0d;
          color: #ddd;
        }
        .fade-in {
          opacity: 0;
          transform: scale(0.9);
          animation: fadeIn 0.6s forwards;
        }
        @keyframes fadeIn {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .role-btn {
          transition: transform 0.3s ease-in-out, box-shadow 0.3s;
        }
        .role-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(212, 89, 6, 0.7);
        }
      `}</style>

      {/* Title */}
          <h1 className="absolute top-20 text-5xl font-extrabold text-orange-500 fade-in">SELECT YOUR ROLE</h1>
          <motion.div 
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.6 }}
>
  {/* content */}
</motion.div>

      <div className="flex w-full h-screen items-center">
        {/* Left Half (Administrator) */}
        <div className="w-1/2 h-full relative flex items-center justify-center">
          <img 
            src="https://media.istockphoto.com/id/1413206511/photo/woman-paying-by-credit-card-at-the-supermarket.jpg?s=612x612&w=0&k=20&c=QsmTIiVo8tivCqr5mPiCEHdTbI-MP8sbT1mmCmBugfc=" 
            alt="Administrator Image" 
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          
          {/* Administrator Role Button */}
          <Link 
            href="/administratorsignup" 
            className="role-btn w-64 bg-orange-600 text-black font-bold py-6 rounded-lg text-2xl shadow-lg hover:bg-orange-700 flex flex-col items-center z-10"
          >
            <img 
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" 
              alt="Admin Icon" 
              className="w-16 h-16 mb-2"
            />
            Administrator
          </Link>
        </div>
        
        {/* Right Half (Customer) */}
        <div className="w-1/2 h-full relative flex items-center justify-center">
          <img 
            src="https://vitaminretailer.com/wp-content/uploads/2022/08/RF-Customer-Service.jpg" 
            alt="Customer Image" 
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />

          {/* Customer Role Button */}
          <Link 
            href="/customersignup" 
            className="role-btn w-64 bg-yellow-500 text-black font-bold py-6 rounded-lg text-2xl shadow-lg hover:bg-yellow-600 flex flex-col items-center z-10"
          >
            <img 
              src="https://cdn-icons-png.flaticon.com/512/456/456283.png" 
              alt="Customer Icon" 
              className="w-16 h-16 mb-2"
            />
            Customer
          </Link>
        </div>
      </div>
    </div>
  );
}