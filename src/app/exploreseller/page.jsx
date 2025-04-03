// src/app/exploreseller/page.jsx
"use client";

import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import AOS with SSR disabled
const AOS = dynamic(() => import('aos').then(mod => mod.default), { ssr: false });

export default function ExploreSeller() {
  useEffect(() => {
    // Initialize AOS when component mounts
    if (typeof window !== 'undefined') {
      import('aos').then((AOS) => {
        AOS.default.init();
      });
    }
  }, []);

  return (
    <div className="relative min-h-screen">
      <Head>
        <title>Seller Portal Features</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css" />
      </Head>

      {/* Background styling */}
      <style jsx global>{`
        body {
          background: url('https://media.istockphoto.com/id/1387134070/photo/smart-store-management-systems-concept.jpg?s=612x612&w=0&k=20&c=zkk0Bxn5wvdL9SBlmAYx-hrZ_v_lQPxWVfocTj0HtHg=') no-repeat center center fixed;
          background-size: cover;
          color: #fff;
          margin: 0;
        }
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: -1;
        }
      `}</style>

      {/* Features Section */}
      <section className="text-center py-20 px-4">
        <h2 className="absolute top-16 left-0 right-0 text-3xl font-bold text-orange-500">
          Seller Portal Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-20">
          {/* Feature Boxes */}
          {[
            {
              icon: '📊',
              title: 'Expiry Tracking',
              description: 'Monitor product expiry and reduce wastage efficiently.'
            },
            {
              icon: '📦',
              title: 'Inventory Alerts',
              description: 'Get stock alerts to manage inventory with ease.'
            },
            {
              icon: '💰',
              title: 'Maximize Profits',
              description: 'Gain insights to optimize sales and revenue growth.'
            },
            {
              icon: '📜',
              title: 'Detailed Reports',
              description: 'Generate detailed reports for better decision-making.'
            },
            {
              icon: '🛍️',
              title: 'Bulk Order Management',
              description: 'Streamline and manage bulk orders effortlessly.'
            },
            {
              icon: '🔒',
              title: 'Enhanced Security',
              description: 'Ensure your data is protected with advanced security.'
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="feature-box p-6 bg-gray-800 rounded-lg shadow-lg text-center border-2 border-transparent transition-all duration-300 hover:scale-105 hover:border-orange-500 hover:shadow-orange-500/20"
              data-aos="fade-up"
            >
              <h3 className="text-xl font-bold text-orange-400">
                {feature.icon} {feature.title}
              </h3>
              <p className="text-gray-400 mt-2">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Go Back Button */}
        <Link 
          href="/" 
          className="inline-block mt-8 bg-orange-500 text-black px-6 py-3 rounded-md font-medium transition-all duration-300 hover:bg-orange-400 hover:scale-105"
        >
          Go Back
        </Link>
      </section>
    </div>
  );
}