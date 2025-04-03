"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        import("aos").then((AOS) => AOS.default.init({ duration: 1000 }));
    }, []);

    return (
        <div className="bg-gradient-to-b from-purple-900 via-indigo-700 to-blue-600 text-white min-h-screen">
            {/* Header */}
            <header className="bg-gradient-to-r from-pink-600 to-red-500 text-white p-4 fixed w-full z-50 shadow-lg">
                <div className="container mx-auto flex justify-between items-center">
                    <motion.h1
                        className="text-4xl font-extrabold tracking-wide"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        INNOVAID
                    </motion.h1>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-6">
                        <Link href="/about" className="hover:text-yellow-300 transition-all duration-300">About</Link>
                        <Link href="/contact" className="hover:text-yellow-300 transition-all duration-300">Contact</Link>
                        <Button variant="outline" className="border-white text-white hover:bg-yellow-300 hover:text-black shadow-md">Login</Button>
                    </nav>

                    {/* Mobile Menu */}
                    <motion.button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden"
                        initial={{ scale: 1 }}
                        animate={{ rotate: menuOpen ? 90 : 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </motion.button>
                </div>

                {/* Mobile Dropdown */}
                {menuOpen && (
                    <motion.div
                        className="md:hidden bg-pink-600 p-4 text-center shadow-lg rounded-lg"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                    >
                        <Link href="/about" className="block py-2 hover:text-yellow-300">About</Link>
                        <Link href="/contact" className="block py-2 hover:text-yellow-300">Contact</Link>
                        <Button variant="outline" className="block mt-2 border-white text-white hover:bg-yellow-300 hover:text-black shadow-lg">Login</Button>
                    </motion.div>
                )}
            </header>

            {/* Hero Section */}
            <motion.section
                className="text-center bg-gradient-to-b from-blue-800 to-blue-900 py-32"
                data-aos="fade-up"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <h1 className="text-5xl font-bold drop-shadow-lg">Track Expiry, Minimize Waste, Maximize Awareness</h1>
                <p className="text-lg text-gray-300 mt-4">INNOVAID helps track expiry smartly, reducing waste.</p>
                <Button className="mt-6 bg-pink-600 text-white hover:bg-yellow-300 hover:text-black shadow-lg">
                    Get Started
                </Button>
            </motion.section>

            {/* Solutions */}
            <motion.section
                className="text-center py-16 bg-gradient-to-b from-indigo-800 via-blue-700 to-blue-900"
                data-aos="fade-up"
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h2 className="text-3xl font-bold text-yellow-300">Smart Expiry Solutions</h2>
                <p className="text-gray-300 mt-2">Track expiry trends & inventory alerts.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mt-8">
                    <motion.div
                        className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg hover:scale-105 transition-transform"
                        whileHover={{ scale: 1.05 }}
                    >
                        <h3 className="text-xl font-bold text-yellow-300">Shop Registration</h3>
                        <p className="text-gray-300 mt-2">Manage your inventory efficiently.</p>
                    </motion.div>
                    <motion.div
                        className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg hover:scale-105 transition-transform"
                        whileHover={{ scale: 1.05 }}
                    >
                        <h3 className="text-xl font-bold text-yellow-300">Expiry Trends</h3>
                        <p className="text-gray-300 mt-2">Optimize inventory tracking.</p>
                    </motion.div>
                </div>
            </motion.section>

            {/* Footer */}
            <motion.footer
                className="bg-pink-600 text-white text-center p-3 shadow-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <p>© 2025 INNOVAID. All Rights Reserved.</p>
            </motion.footer>
        </div>
    );
}






