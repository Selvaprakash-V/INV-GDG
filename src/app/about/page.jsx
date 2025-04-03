// src/app/about/page.jsx
"use client";

import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';

// Dynamically import AOS with SSR disabled
const AOS = dynamic(() => import('aos').then(mod => mod.default), { ssr: false });

export default function AboutPage() {
  useEffect(() => {
    // Initialize AOS when component mounts
    if (typeof window !== 'undefined') {
      import('aos').then((AOS) => {
        AOS.default.init();
      });
    }
  }, []);

  return (
    <>
      <Head>
        <title>About INNOVAID</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css" />
      </Head>

      <style jsx global>{`
        /* Background Image */
        body {
          background: url('https://media.licdn.com/dms/image/v2/D4D12AQETcKrloH4iWQ/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1693680715319?e=2147483647&v=beta&t=teYEUrMyvJOuLv3gfk6oC5McfQyD2vEzm_uCtfNvnpU') no-repeat center center fixed;
          background-size: cover;
          font-family: Arial, sans-serif;
          color: #d3d3d3;
          margin: 0;
          padding: 0;
        }

        /* Dark Overlay to Dull the Background */
        body::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.6);
          z-index: -1;
        }

        /* Navbar */
        nav {
          background-color: rgba(255, 123, 0, 0.9);
          color: #101010;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 10;
        }

        nav a {
          color: #101010;
          font-weight: bold;
          padding: 0.5rem 1rem;
          text-decoration: none;
          transition: color 0.3s;
        }

        nav a:hover {
          color: #333;
        }

        /* Section Styling */
        section {
          padding: 4rem 2rem;
        }

        .main-content {
          padding-top: 80px;
        }

        .info-box {
          background: rgba(0, 0, 0, 0.7);
          border: 2px solid #d3d3d3;
          padding: 1.5rem;
          border-radius: 10px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
          transition: box-shadow 0.3s, border-color 0.3s;
        }

        .info-box:hover {
          border-color: #ff7b00;
          box-shadow: 0 0 20px #ff7b00;
        }

        .btn {
          background: #ff7b00;
          color: #fff;
          font-weight: bold;
          padding: 0.75rem 1.5rem;
          border-radius: 5px;
          transition: background 0.3s, transform 0.3s;
        }

        .btn:hover {
          background: #ff944d;
          transform: scale(1.05);
        }

        footer {
          background-color: #ff7b00;
          color: #fff;
          text-align: center;
          padding: 1rem;
        }
      `}</style>

      {/* Header */}
      <header>
        <nav className="flex justify-between items-center p-4 shadow-md">
          <h1 className="text-3xl font-extrabold tracking-wide">INNOVAID</h1>
          <div className="space-x-6">
            <Link href="/">Home</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/">Back</Link>
          </div>
        </nav>
      </header>

      {/* About Section */}
      <section className="main-content max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-white mb-6">About INNOVAID</h2>
        <p className="text-lg mb-10 text-gray-300">
          INNOVAID simplifies inventory management for both <strong>supermarkets</strong> and <strong>consumers</strong>, offering smart solutions to track expiry dates, reduce wastage, and enhance efficiency. Here's how it works:
        </p>

        {/* Supermarket Portal */}
        <div className="info-box mb-8" data-aos="fade-up">
          <h3 className="text-2xl font-bold text-white mb-4">For Supermarkets</h3>
          <p className="text-gray-300">
            Supermarkets benefit from powerful tools to manage inventory effectively:
          </p>
          <ul className="list-disc list-inside mt-4 text-left mx-auto max-w-sm text-gray-300">
            <li>Real-time stock tracking</li>
            <li>Predictive analytics for future demand</li>
            <li>Expiry alerts to reduce wastage</li>
          </ul>
        </div>

        {/* Consumer Portal */}
        <div className="info-box" data-aos="fade-up">
          <h3 className="text-2xl font-bold text-white mb-4">For Consumers</h3>
          <p className="text-gray-300">
            Consumers can track product purchases and access detailed information:
          </p>
          <ul className="list-disc list-inside mt-4 text-left mx-auto max-w-sm text-gray-300">
            <li>Find affiliated supermarkets</li>
            <li>View recent purchases and expiry details</li>
            <li>Receive alerts for items nearing expiration</li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <p>© 2025 INNOVAID. All rights reserved.</p>
      </footer>
    </>
  );
}