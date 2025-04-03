// src/app/contact/page.jsx
"use client";

import { useEffect, useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Dynamically import AOS and animejs with SSR disabled
const AOS = dynamic(() => import('aos').then(mod => mod.default), { ssr: false });
const anime = dynamic(() => import('animejs').then(mod => mod.default), { ssr: false });

export default function ContactPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const initializeAnimations = async () => {
      if (typeof window !== 'undefined') {
        // Initialize AOS
        const AOS = await import('aos');
        AOS.default.init({
          duration: 800,
          easing: 'ease-in-out',
          once: true
        });

        // Initialize anime.js for text glow effect
        const anime = await import('animejs');
        anime.default({
          targets: ".glow-text",
          opacity: [0.8, 1],
          textShadow: [
            '0 0 5px rgba(255,215,0,0.5)',
            '0 0 15px rgba(255,215,0,0.8)',
            '0 0 5px rgba(255,215,0,0.5)'
          ],
          duration: 2000,
          easing: "easeInOutSine",
          direction: 'alternate',
          loop: true
        });
      }
    };

    initializeAnimations();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message Sent Successfully!");
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-yellow-100">
      <Head>
        <title>Contact - INNOVAID</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css" />
      </Head>

      <style jsx global>{`
        body {
          background: linear-gradient(135deg, #e0f2fe 0%, #fef9c3 100%);
        }
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }
        .floating {
          animation: float 3s infinite ease-in-out;
        }
        .glow-text {
          text-shadow: 0 0 5px rgba(255,215,0,0.5);
          color: #d4af37;
        }
        .glow-text:hover {
          text-shadow: 0 0 15px rgba(255,215,0,0.8);
        }
        .btn-gold {
          background: linear-gradient(to right, #FFD700, #D4AF37);
          color: #000;
          box-shadow: 0 0 10px rgba(255,215,0,0.5);
        }
        .btn-gold:hover {
          background: linear-gradient(to right, #D4AF37, #FFD700);
          box-shadow: 0 0 20px rgba(255,215,0,0.8);
          transform: scale(1.05);
        }
        .gold-border {
          border: 1px solid rgba(212, 175, 55, 0.3);
        }
      `}</style>

      {/* Header */}
      <header className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-black p-5 shadow-lg fixed top-0 w-full z-50">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-extrabold tracking-wide glow-text">
            INNOVAID
          </h1>

          <nav className="hidden md:flex items-center space-x-6 text-lg font-semibold">
            <a href="/" className="hover:text-yellow-700 transition-colors">Home</a>
            <a href="/about" className="hover:text-yellow-700 transition-colors">About</a>
            <a href="/login" className="btn-gold px-4 py-2 rounded-lg font-bold transition-all">
              LOGIN
            </a>
          </nav>

          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-8 h-8 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>

        <div 
          className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-yellow-400 text-center p-4 space-y-2`}
        >
          <a href="/" className="block py-2 hover:text-yellow-700">Home</a>
          <a href="/about" className="block py-2 hover:text-yellow-700">About</a>
          <a href="/contact" className="block py-2 hover:text-yellow-700">Contact</a>
          <a href="/login" className="block py-2 btn-gold rounded-lg font-bold">LOGIN</a>
          <a href="/signup" className="block py-2 bg-white text-yellow-600 rounded-lg font-bold">SIGN UP</a>
        </div>
      </header>

      {/* Contact Section */}
      <section className="max-w-4xl mx-auto mt-40 mb-20 p-8 bg-white bg-opacity-80 shadow-lg rounded-lg floating gold-border" data-aos="fade-up">
        <h2 className="text-4xl font-bold text-center glow-text mb-4">Get in Touch</h2>
        <p className="text-gray-700 text-lg text-center">
          Have questions or need support? Reach out to us using the form below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="p-6 bg-white bg-opacity-90 rounded-lg shadow-md text-center gold-border" data-aos="fade-right">
            <h3 className="text-xl font-bold glow-text mb-4">Contact Info</h3>
            <p className="text-gray-700 mt-2">📍 123 Main St, Anytown, 12345</p>
            <p className="text-gray-700 mt-2">📧 info@innovaid.com</p>
            <p className="text-gray-700 mt-2">📞 +1-555-123-4567</p>
          </div>

          <form 
            className="p-6 bg-white bg-opacity-90 rounded-lg shadow-md gold-border" 
            onSubmit={handleSubmit}
            data-aos="fade-left"
          >
            <label htmlFor="name" className="block text-yellow-600 font-semibold">Your Name</label>
            <input 
              type="text" 
              id="name" 
              className="w-full p-2 mt-2 bg-blue-50 text-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400" 
              placeholder="John Doe" 
              required 
            />

            <label htmlFor="email" className="block text-yellow-600 font-semibold mt-4">Your Email</label>
            <input 
              type="email" 
              id="email" 
              className="w-full p-2 mt-2 bg-blue-50 text-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400" 
              placeholder="example@email.com" 
              required 
            />

            <label htmlFor="message" className="block text-yellow-600 font-semibold mt-4">Your Message</label>
            <textarea 
              id="message" 
              className="w-full p-2 mt-2 bg-blue-50 text-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400" 
              placeholder="Type your message..." 
              required
            ></textarea>

            <button 
              type="submit" 
              className="w-full mt-4 px-4 py-2 btn-gold rounded-lg font-bold transition-all"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}