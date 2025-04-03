"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"; // Using ShadCN button component
import Link from "next/link";

export default function Home() {
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        import("aos").then((AOS) => AOS.default.init());
    }, []);

    return (
        <div className="bg-black text-gray-300 min-h-screen">
            {/* Header */}
            <header className="bg-gradient-to-r from-orange-600 to-orange-500 text-black p-4 fixed w-full z-50">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold tracking-wide">INNOVAID</h1>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-6">
                        <Link href="/about" className="hover:text-white">About</Link>
                        <Link href="/contact" className="hover:text-white">Contact</Link>
                        <Button variant="outline" className="border-black text-black">Login</Button>
                    </nav>

                    {/* Mobile Menu */}
                    <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                </div>

                {/* Mobile Dropdown */}
                {menuOpen && (
                    <div className="md:hidden bg-orange-600 p-4 text-center">
                        <Link href="/about" className="block py-2">About</Link>
                        <Link href="/contact" className="block py-2">Contact</Link>
                        <Button variant="outline" className="block mt-2 border-black text-black">Login</Button>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section className="text-center bg-gray-900 text-white py-32" data-aos="fade-up">
                <h1 className="text-5xl font-bold">Track Expiry, Minimize Waste, Maximize Awareness</h1>
                <p className="text-lg text-gray-400 mt-4">INNOVAID helps track expiry smartly, reducing waste.</p>
                <Button className="mt-6 bg-orange-600 text-black hover:bg-orange-700">
                    Get Started
                </Button>
            </section>

            {/* Solutions */}
            <section className="text-center py-16 bg-gray-900" data-aos="fade-up">
                <h2 className="text-3xl font-bold text-orange-500">Smart Expiry Solutions</h2>
                <p className="text-gray-400 mt-2">Track expiry trends & inventory alerts.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mt-8">
                    <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
                        <h3 className="text-xl font-bold text-orange-500">Shop Registration</h3>
                        <p className="text-gray-400 mt-2">Manage your inventory efficiently.</p>
                    </div>
                    <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
                        <h3 className="text-xl font-bold text-orange-500">Expiry Trends</h3>
                        <p className="text-gray-400 mt-2">Optimize inventory tracking.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-orange-600 text-black text-center p-3">
                <p>© 2025 INNOVAID. All Rights Reserved.</p>
            </footer>
        </div>
    );
}