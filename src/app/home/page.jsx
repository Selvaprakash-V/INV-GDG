'use client';

import { useState, useEffect, useId } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  User,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Calendar,
  QrCode,
  Sparkles,
  ArrowRight,
  BarChart3,
  Clock,
  Leaf,
  DollarSign,
  Smartphone,
  ChevronDown,
  RefreshCw,
  Zap,
  Boxes,
  Bell,
  Calculator,
  Activity,
  Award,
  Flame,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SiteFooter from '@/components/SiteFooter';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('retailer'); // 'retailer' | 'consumer'
  const [calcMode, setCalcMode] = useState('retailer'); // 'retailer' | 'household'
  const [monthlySpend, setMonthlySpend] = useState(35000); // Retail default $35,000/mo
  const [openFaq, setOpenFaq] = useState(0);

  const retailerSpendInputId = useId();
  const householdSpendInputId = useId();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ROI / Waste savings calculations
  const calculateSavings = () => {
    if (calcMode === 'retailer') {
      const avgSpoilageRate = 0.082; // 8.2% baseline supermarket spoilage
      const spoilageLoss = monthlySpend * avgSpoilageRate;
      const recoveredPercentage = 0.42; // TrackIt saves ~42% via timely markdowns & rotation
      const monthlySaved = spoilageLoss * recoveredPercentage;
      const annualSaved = monthlySaved * 12;
      const foodKgSaved = Math.round((annualSaved / 4.2) * 1.5);
      const co2eSavedTons = ((foodKgSaved * 2.5) / 1000).toFixed(1);
      return {
        annualSaved: Math.round(annualSaved).toLocaleString(),
        foodKgSaved: foodKgSaved.toLocaleString(),
        co2eSavedTons,
        wasteReductionPercent: 42,
      };
    } else {
      const householdSpoilageRate = 0.24; // 24% baseline domestic food waste
      const spoilageLoss = monthlySpend * householdSpoilageRate;
      const recoveredPercentage = 0.65; // TrackIt saves 65% via expiry reminders
      const monthlySaved = spoilageLoss * recoveredPercentage;
      const annualSaved = monthlySaved * 12;
      const foodKgSaved = Math.round(annualSaved / 5.5);
      const co2eSavedTons = ((foodKgSaved * 2.1) / 1000).toFixed(1);
      return {
        annualSaved: Math.round(annualSaved).toLocaleString(),
        foodKgSaved: foodKgSaved.toLocaleString(),
        co2eSavedTons,
        wasteReductionPercent: 65,
      };
    }
  };

  const savings = calculateSavings();

  const faqs = [
    {
      q: 'How does TrackIt prevent inventory spoilage for supermarkets?',
      a: 'TrackIt establishes a predictive batch radar. Whenever new products are added, expiry horizons are tracked per batch. As items approach critical thresholds (e.g. 7 days or 48 hours), TrackIt automatically triggers multi-channel staff notifications, suggests targeted dynamic discounts, and logs deductions at the POS so expired items never reach the checkout counter.',
    },
    {
      q: 'Can consumers connect their purchases directly to the TrackIt pantry app?',
      a: 'Yes! When shoppers purchase from participating TrackIt supermarkets, their receipt barcode or QR code instantly imports every item, expiration date, and category into their personal consumer dashboard. They receive push reminders before items spoil in their home fridge.',
    },
    {
      q: 'Does TrackIt require expensive proprietary hardware or special scanners?',
      a: 'Not at all. TrackIt operates seamlessly on any existing browser, tablet, smartphone camera, or standard USB/Bluetooth barcode scanner. It is fully responsive, lightweight, and cloud-native with zero hardware lock-in.',
    },
    {
      q: 'What supermarket departments and categories are supported?',
      a: 'TrackIt supports all perishable and non-perishable categories: Dairy, Bakery, Fresh Produce, Meat & Seafood, Deli, Beverages, Frozen Foods, Snacks, Canned Goods, Household, and Personal Care.',
    },
    {
      q: 'How does TrackIt handle data security and multi-tenant store isolation?',
      a: 'Every supermarket store operates within strict multi-tenant boundaries enforced by server-side query scopes. Passwords are salted with bcrypt, sessions are cryptographically signed JWTs, and all sales records execute inside ACID-compliant multi-document transactions on MongoDB Atlas.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-purple-500 selection:text-white">
      {/* Dynamic Background Accents */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-pink-300/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl" />
      </div>

      {/* Modern Sticky Navigation */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/85 backdrop-blur-md shadow-sm border-b border-purple-100/80 py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
          <Link href="/home" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-purple-700 via-purple-900 to-indigo-800 bg-clip-text text-transparent">
                TRAC<span className="text-pink-600">KIT</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                v2.0 Pilot
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-purple-600 transition-colors">
              How It Works
            </a>
            <a href="#solutions" className="hover:text-purple-600 transition-colors">
              Dual Ecosystem
            </a>
            <a href="#calculator" className="hover:text-purple-600 transition-colors">
              ROI & Impact
            </a>
            <a href="#departments" className="hover:text-purple-600 transition-colors">
              Categories
            </a>
            <a href="#faq" className="hover:text-purple-600 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Desktop Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-700 hover:text-purple-700 font-semibold">
                Sign In
              </Button>
            </Link>
            <Link href="/role">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-md shadow-purple-400/30 rounded-xl px-5">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-purple-100/50 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-purple-100 shadow-xl overflow-hidden"
            >
              <div className="flex flex-col p-6 space-y-4">
                <a
                  href="#how-it-works"
                  onClick={() => setIsMenuOpen(false)}
                  className="font-medium text-slate-700 hover:text-purple-600 py-2 border-b border-slate-100"
                >
                  How It Works
                </a>
                <a
                  href="#solutions"
                  onClick={() => setIsMenuOpen(false)}
                  className="font-medium text-slate-700 hover:text-purple-600 py-2 border-b border-slate-100"
                >
                  Dual Ecosystem
                </a>
                <a
                  href="#calculator"
                  onClick={() => setIsMenuOpen(false)}
                  className="font-medium text-slate-700 hover:text-purple-600 py-2 border-b border-slate-100"
                >
                  ROI Calculator
                </a>
                <a
                  href="#faq"
                  onClick={() => setIsMenuOpen(false)}
                  className="font-medium text-slate-700 hover:text-purple-600 py-2 border-b border-slate-100"
                >
                  FAQ
                </a>
                <div className="flex flex-col gap-2 pt-2">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/role" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full justify-center bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-40 pb-20 px-4 md:px-8 overflow-hidden">
        <div className="container mx-auto max-w-6xl text-center">
          {/* Innovation Pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/80 border border-purple-200/80 text-purple-800 text-xs md:text-sm font-semibold mb-6 shadow-xs backdrop-blur-xs"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Smart Grocery & Inventory Expiry Radar</span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span className="text-purple-600">UN SDG 12.3 Aligned</span>
          </motion.div>

          {/* Main Hero Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6"
          >
            Eliminate Food Spoilage.{' '}
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
              Protect Margins.
            </span>
            <br className="hidden sm:inline" /> Empower Smarter Groceries.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-600 leading-relaxed mb-10"
          >
            TrackIt is the high-velocity, closed-loop platform connecting <strong>supermarkets</strong> and{' '}
            <strong>household consumers</strong>. Automatically track batch expiry, trigger early markdown alerts at the POS,
            and synchronize purchased food to digital pantries before it spoils.
          </motion.p>

          {/* Hero Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link href="/role" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-base px-8 py-6 rounded-2xl shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/35 hover:-translate-y-0.5 transition-all"
              >
                Launch Free Store Pilot
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="#interactive-demo" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white/90 hover:bg-slate-100 text-slate-800 border-slate-300 font-bold text-base px-8 py-6 rounded-2xl shadow-sm hover:-translate-y-0.5 transition-all"
              >
                <Activity className="w-5 h-5 mr-2 text-purple-600" />
                Explore Live Demo
              </Button>
            </a>
          </motion.div>

          {/* Social Proof Stats Strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-white/70 backdrop-blur-md border border-purple-100 shadow-sm max-w-4xl mx-auto"
          >
            <div className="text-center p-3 border-r border-slate-100 last:border-none">
              <p className="text-3xl lg:text-4xl font-extrabold text-purple-600">42%</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Average Waste Reduction</p>
            </div>
            <div className="text-center p-3 border-r border-slate-100 last:border-none">
              <p className="text-3xl lg:text-4xl font-extrabold text-pink-600">&lt; 48 Hrs</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Early Warning Radar</p>
            </div>
            <div className="text-center p-3 border-r border-slate-100 last:border-none">
              <p className="text-3xl lg:text-4xl font-extrabold text-indigo-600">100%</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">ACID POS Transaction Sync</p>
            </div>
            <div className="text-center p-3">
              <p className="text-3xl lg:text-4xl font-extrabold text-emerald-600">0 App</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Hardware Free / PWA</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Product Simulator / Showcase */}
      <section id="interactive-demo" className="py-20 bg-gradient-to-b from-transparent via-purple-50/60 to-transparent">
        <div className="container mx-auto max-w-6xl px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50 mb-3 px-3 py-1 font-bold">
              Interactive Product Showcase
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Two Roles. One Unified Expiry Ecosystem.
            </h2>
            <p className="text-slate-600 mt-3 text-base md:text-lg">
              Switch views below to explore how TrackIt empowers supermarket operators and everyday consumers.
            </p>

            {/* Role Switcher Pill */}
            <div className="inline-flex p-1.5 mt-6 rounded-2xl bg-white border border-purple-200 shadow-md">
              <button
                type="button"
                onClick={() => setActiveTab('retailer')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                  activeTab === 'retailer'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                    : 'text-slate-600 hover:text-purple-600'
                }`}
              >
                <Store className="w-4 h-4" />
                Supermarket Administrator
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('consumer')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                  activeTab === 'consumer'
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md shadow-pink-500/20'
                    : 'text-slate-600 hover:text-pink-600'
                }`}
              >
                <User className="w-4 h-4" />
                Household Consumer (PWA)
              </button>
            </div>
          </div>

          {/* Interactive Screen Simulator */}
          <div className="bg-white rounded-3xl border border-purple-100 shadow-2xl overflow-hidden transition-all duration-500">
            {/* Mockup Top Window Chrome */}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="ml-3 text-xs font-mono text-slate-400">
                  {activeTab === 'retailer'
                    ? 'https://trackit.app/admin/dashboard — Apple Supermarket'
                    : 'https://trackit.app/customer/dashboard — Home Pantry'}
                </span>
              </div>
              <Badge className={activeTab === 'retailer' ? 'bg-purple-600' : 'bg-pink-600'}>
                {activeTab === 'retailer' ? 'Store Command Center' : 'Customer Digital Pantry'}
              </Badge>
            </div>

            {/* Tab 1: Retailer Dashboard Mockup */}
            {activeTab === 'retailer' && (
              <div className="p-6 md:p-8 space-y-6 bg-slate-50/50">
                {/* Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Inventory</span>
                      <Boxes className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-black text-slate-900 mt-2">52 Products</p>
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3.5 h-3.5" /> 10 Departments Active
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs bg-amber-50/20">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Expiring Soon</span>
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    </div>
                    <p className="text-2xl font-black text-amber-900 mt-2">7 Items</p>
                    <span className="text-xs text-amber-700 font-semibold mt-1 inline-block">
                      Under 48 hours horizon
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-xs bg-rose-50/20">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Low Stock Warnings</span>
                      <Flame className="w-5 h-5 text-rose-500" />
                    </div>
                    <p className="text-2xl font-black text-rose-900 mt-2">4 SKUs</p>
                    <span className="text-xs text-rose-600 font-semibold mt-1 inline-block">Reorder suggested</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs bg-emerald-50/20">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Spoilage Prevented</span>
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-black text-emerald-900 mt-2">$1,480.00</p>
                    <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">This month to date</span>
                  </div>
                </div>

                {/* Live Sample Inventory Table */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      Dynamic Shelf-Life Watchlist (Live Batch Sample)
                    </h3>
                    <span className="text-xs text-slate-500">Sync: Realtime POS Linked</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="p-3.5 pl-5">Product Name</th>
                          <th className="p-3.5">Category</th>
                          <th className="p-3.5">Stock</th>
                          <th className="p-3.5">Expiry Horizon</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 pr-5">Automated Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        <tr className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3.5 pl-5 font-bold text-slate-800">Fresh Whole Milk 1L</td>
                          <td className="p-3.5 text-slate-600">Dairy</td>
                          <td className="p-3.5">45 units</td>
                          <td className="p-3.5 text-slate-600">12 Days Remaining</td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                              Optimal
                            </span>
                          </td>
                          <td className="p-3.5 pr-5 text-xs text-slate-500">Regular Shelf Rotation</td>
                        </tr>
                        <tr className="hover:bg-slate-50/60 transition-colors bg-amber-50/30">
                          <td className="p-3.5 pl-5 font-bold text-slate-800">Artisan Sourdough Loaf</td>
                          <td className="p-3.5 text-slate-600">Bakery</td>
                          <td className="p-3.5 font-bold text-amber-700">12 units</td>
                          <td className="p-3.5 text-amber-700 font-bold">2 Days Remaining</td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
                              Critical
                            </span>
                          </td>
                          <td className="p-3.5 pr-5">
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                              Flash 30% Off Alert
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3.5 pl-5 font-bold text-slate-800">Crisp Royal Gala Apples</td>
                          <td className="p-3.5 text-slate-600">Produce</td>
                          <td className="p-3.5">60 kg</td>
                          <td className="p-3.5 text-slate-600">14 Days Remaining</td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                              Optimal
                            </span>
                          </td>
                          <td className="p-3.5 pr-5 text-xs text-slate-500">Regular Display</td>
                        </tr>
                        <tr className="hover:bg-slate-50/60 transition-colors bg-rose-50/20">
                          <td className="p-3.5 pl-5 font-bold text-slate-800">Organic Baby Spinach 250g</td>
                          <td className="p-3.5 text-slate-600">Produce</td>
                          <td className="p-3.5 font-bold text-rose-700">4 packs (Low)</td>
                          <td className="p-3.5 text-amber-600 font-semibold">3 Days Remaining</td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800">
                              Low Stock & Expiry
                            </span>
                          </td>
                          <td className="p-3.5 pr-5 text-xs font-semibold text-rose-600">Auto Reorder Dispatched</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Consumer PWA Mockup */}
            {activeTab === 'consumer' && (
              <div className="p-6 md:p-8 space-y-6 bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Digital Pantry Card */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs md:col-span-2 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">My Household Digital Pantry</h3>
                        <p className="text-xs text-slate-500">Auto-imported via QR scan at Apple Supermarket</p>
                      </div>
                      <Badge className="bg-emerald-600">Pantry Active</Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🥛</span>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">Fresh Whole Milk</p>
                            <p className="text-xs text-slate-500">Purchased Nov 14 • 1L Bottle</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                            Expires in 8 Days
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🍞</span>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">Whole Wheat Pita Pockets</p>
                            <p className="text-xs text-amber-700 font-semibold">Eat today or tomorrow!</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                            Expires in 24 Hrs
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🥑</span>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">Hass Avocados (3-Pack)</p>
                            <p className="text-xs text-slate-500">Pantry produce shelf</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                            Expires in 4 Days
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Smart Budget & Waste Tracker */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Household Savings</h4>
                        <Leaf className="w-5 h-5 text-emerald-500" />
                      </div>
                      <p className="text-3xl font-black text-slate-900">$185.00</p>
                      <p className="text-xs text-slate-500 mt-1">Saved on groceries this month</p>

                      <div className="mt-6 space-y-3">
                        <div>
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-slate-600">Monthly Food Budget ($500)</span>
                            <span className="text-purple-600">$315 spent (63%)</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="w-[63%] h-full bg-purple-600 rounded-full" />
                          </div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs text-purple-900">
                          <p className="font-bold flex items-center gap-1.5 mb-1">
                            <Bell className="w-3.5 h-3.5 text-purple-600" /> Smart Reminder Active
                          </p>
                          Notifications sent to your email & phone 48 hours before perishable items expire.
                        </div>
                      </div>
                    </div>

                    <Link href="/customersignup" className="mt-6">
                      <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm">
                        Create Free Customer Pantry
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* The Global Crisis & Real Problem (Design Thinking: Empathize & Define) */}
      <section className="py-20 px-4 md:px-8 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-at-c from-purple-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest font-extrabold text-pink-400 mb-2 inline-block">
              The $1.3 Trillion Crisis
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
              Food Waste Is an Economic & Environmental Disaster
            </h2>
            <p className="text-slate-300 mt-4 text-base md:text-lg">
              Traditional inventory and static receipts leave both retailers and households blind to spoilage.
              TrackIt transforms food management from a reactive write-off into a proactive savings machine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-800/80 border border-slate-700/80 hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">33% of Global Food Lost</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Over 1.3 billion tons of wholesome food is discarded every year, largely due to unmonitored shelf-life
                and disconnected consumer pantries.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-800/80 border border-slate-700/80 hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Crushed Retail Margins</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Supermarkets operate on paper-thin 1.5% - 3% net margins. Spoilage losses of 8% to 10% erode over half of
                potential grocery retail profits.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-800/80 border border-slate-700/80 hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">10% Greenhouse Emissions</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Food rotting in landfills generates potent methane gas. Preventing domestic and retail spoilage is
                ranked by Project Drawdown as a top climate solution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How TrackIt Works: 3-Step Seamless Flow */}
      <section id="how-it-works" className="py-24 px-4 md:px-8 bg-white relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 px-3 py-1 font-bold mb-3">
              Frictionless Architecture
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              How TrackIt Operates in 3 Simple Steps
            </h2>
            <p className="text-slate-600 mt-4 text-base md:text-lg">
              A closed-loop system bridging supermarket stock intake, real-time sales transactions, and consumer digital pantries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative p-8 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <span className="text-5xl font-black text-purple-200">01</span>
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center my-4 shadow-md shadow-purple-500/20">
                  <Boxes className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Batch Ingestion</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Supermarkets scan or batch-import inventory with expiry dates. TrackIt assigns barcode identifiers and
                  organizes items into monitored departments with threshold alert triggers.
                </p>
              </div>
              <ul className="mt-6 space-y-2 text-xs font-semibold text-slate-600 border-t border-slate-200/60 pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600" /> Barcode & SKU auto-generation
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600" /> Custom expiry notification horizons
                </li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="relative p-8 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <span className="text-5xl font-black text-purple-200">02</span>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center my-4 shadow-md shadow-indigo-500/20">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">ACID POS & Expiry Radar</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Point-of-sale checkout immediately decrements stock via MongoDB multi-document transactions. The radar
                  surfaces near-expiry stock so staff can apply dynamic markdowns before items go bad.
                </p>
              </div>
              <ul className="mt-6 space-y-2 text-xs font-semibold text-slate-600 border-t border-slate-200/60 pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600" /> Multi-document transaction safety
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600" /> Automated markdowns & staff alerts
                </li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="relative p-8 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <span className="text-5xl font-black text-purple-200">03</span>
                <div className="w-12 h-12 rounded-2xl bg-pink-600 text-white flex items-center justify-center my-4 shadow-md shadow-pink-500/20">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Consumer QR Handoff</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Customers scan their receipt or item QR code to automatically import all purchased groceries into their
                  personal digital pantry. Reminders alert them before food spoils in their fridge.
                </p>
              </div>
              <ul className="mt-6 space-y-2 text-xs font-semibold text-slate-600 border-t border-slate-200/60 pt-4">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-pink-600" /> Zero installation browser PWA
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-pink-600" /> Push notifications & budget tracking
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Solutions Deep Dive (Supermarkets vs Consumers) */}
      <section id="solutions" className="py-24 px-4 md:px-8 bg-gradient-to-b from-purple-50/50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 px-3 py-1 font-bold mb-3">
              Comprehensive Capabilities
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              Tailored Portals for Every Stakeholder
            </h2>
            <p className="text-slate-600 mt-4 text-base md:text-lg">
              Explore the dedicated feature suites built specifically for store administrators and everyday grocery consumers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Supermarket Portal Card */}
            <div className="p-8 md:p-10 rounded-3xl bg-white border border-purple-100 shadow-xl shadow-purple-500/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Store className="w-7 h-7" />
                  </div>
                  <Badge className="bg-purple-600 text-white font-bold">For Retail Operations</Badge>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-2">Supermarket Administrator Suite</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Engineered for store managers, inventory supervisors, and retail chain operators to protect inventory investment.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-lg bg-purple-50 text-purple-600 mt-0.5">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Predictive Expiry Analytics</h4>
                      <p className="text-xs text-slate-500">Visual trend charts, stock loss projections, and inventory value radar.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-lg bg-purple-50 text-purple-600 mt-0.5">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Automated Multi-Channel Alerts</h4>
                      <p className="text-xs text-slate-500">Daily digests and real-time warnings whenever stock enters critical expiry window.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-lg bg-purple-50 text-purple-600 mt-0.5">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Dynamic Discounting Engine</h4>
                      <p className="text-xs text-slate-500">Auto-suggest tiered markdowns (e.g. 25% at 3 days, 50% at 24 hours) to recover cash flow.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-lg bg-purple-50 text-purple-600 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">ACID Transaction Safety</h4>
                      <p className="text-xs text-slate-500">Multi-document transactional guarantees prevent ghost stock and race conditions.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <Link href="/administratorsignup" className="flex-1">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl py-5">
                    Register Supermarket
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
                <Link href="/exploreseller">
                  <Button variant="outline" className="w-full sm:w-auto font-bold rounded-xl py-5">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>

            {/* Consumer Portal Card */}
            <div className="p-8 md:p-10 rounded-3xl bg-white border border-pink-100 shadow-xl shadow-pink-500/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center">
                    <User className="w-7 h-7" />
                  </div>
                  <Badge className="bg-pink-600 text-white font-bold">For Household Shoppers</Badge>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-2">Consumer Smart Pantry (PWA)</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  The lightweight web app that turns ordinary grocery receipts into an intelligent home food manager.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-lg bg-pink-50 text-pink-600 mt-0.5">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Instant QR & Barcode Ingestion</h4>
                      <p className="text-xs text-slate-500">Scan physical barcodes or digital supermarket receipts with your phone camera.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-lg bg-pink-50 text-pink-600 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Personal Expiry Horizon Reminders</h4>
                      <p className="text-xs text-slate-500">Never open your fridge to find spoiled milk or wilted vegetables again.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-lg bg-pink-50 text-pink-600 mt-0.5">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Monthly Grocery Budget Tracking</h4>
                      <p className="text-xs text-slate-500">Set monthly/weekly caps and track exactly how much money your pantry saves.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-lg bg-pink-50 text-pink-600 mt-0.5">
                      <Leaf className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Eco & CO2e Environmental Score</h4>
                      <p className="text-xs text-slate-500">See your personal contribution to carbon reduction and landfill diversion.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <Link href="/customersignup" className="flex-1">
                  <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl py-5">
                    Start Free Pantry
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
                <Link href="/explorecustomer">
                  <Button variant="outline" className="w-full sm:w-auto font-bold rounded-xl py-5">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Spoilage & ROI Savings Calculator */}
      <section id="calculator" className="py-24 px-4 md:px-8 bg-slate-900 text-white relative">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="bg-purple-900 text-purple-300 border-purple-700 px-3 py-1 font-bold mb-3">
              Interactive ROI Engine
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              Calculate Your Spoilage Savings
            </h2>
            <p className="text-slate-300 mt-3 text-base md:text-lg">
              Adjust the sliders below to project how much capital and food waste TrackIt saves each year.
            </p>

            {/* Mode Switcher */}
            <div className="inline-flex p-1 mt-6 rounded-xl bg-slate-800 border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setCalcMode('retailer');
                  setMonthlySpend(35000);
                }}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                  calcMode === 'retailer' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Supermarket Store ($)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCalcMode('household');
                  setMonthlySpend(650);
                }}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                  calcMode === 'household' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Household Consumer ($)
              </button>
            </div>
          </div>

          <div className="bg-slate-800/90 rounded-3xl border border-slate-700 p-8 md:p-12 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Input Controls */}
            <div className="lg:col-span-7 space-y-6">
              {calcMode === 'retailer' ? (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor={retailerSpendInputId} className="text-sm font-semibold text-slate-300">Monthly Grocery Turnover / Inventory</label>
                    <span className="text-2xl font-black text-purple-400">
                      ${monthlySpend.toLocaleString()}
                    </span>
                  </div>
                  <input
                    id={retailerSpendInputId}
                    type="range"
                    min="5000"
                    max="150000"
                    step="2500"
                    value={monthlySpend}
                    onChange={(e) => setMonthlySpend(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-700 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-2">
                    <span>$5,000 / mo (Boutique)</span>
                    <span>$150,000+ / mo (Large Supermarket)</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor={householdSpendInputId} className="text-sm font-semibold text-slate-300">Monthly Household Grocery Budget</label>
                    <span className="text-2xl font-black text-pink-400">
                      ${monthlySpend.toLocaleString()}
                    </span>
                  </div>
                  <input
                    id={householdSpendInputId}
                    type="range"
                    min="200"
                    max="2000"
                    step="50"
                    value={monthlySpend}
                    onChange={(e) => setMonthlySpend(Number(e.target.value))}
                    className="w-full accent-pink-500 cursor-pointer h-2 bg-slate-700 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-2">
                    <span>$200 / mo (Single)</span>
                    <span>$2,000 / mo (Large Family)</span>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60 text-xs text-slate-300 space-y-1.5">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-purple-400" />
                  Methodology & Parameters:
                </p>
                <p>
                  Calculated against standard USDA & WRAP retail metrics: baseline{' '}
                  {calcMode === 'retailer' ? '8.2% store spoilage' : '24% domestic food waste'} reduced by{' '}
                  <span className="font-bold text-emerald-400">{savings.wasteReductionPercent}%</span> via early detection
                  markdowns and timely consumption alerts.
                </p>
              </div>
            </div>

            {/* Projected Savings Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-purple-900/60 via-slate-900/80 to-indigo-950/60 p-6 md:p-8 rounded-2xl border border-purple-500/30 text-center space-y-6">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-slate-400">
                  Projected Annual Recovery
                </span>
                <p className="text-4xl md:text-5xl font-black text-emerald-400 mt-2">
                  ${savings.annualSaved}
                </p>
                <p className="text-xs text-slate-400 mt-1">Dollars saved from avoidable spoilage</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700/80 text-left">
                <div className="p-3 bg-slate-800/80 rounded-xl">
                  <span className="text-[11px] text-slate-400 block font-medium">Food Rescued</span>
                  <span className="text-lg font-bold text-purple-300">{savings.foodKgSaved} kg</span>
                </div>
                <div className="p-3 bg-slate-800/80 rounded-xl">
                  <span className="text-[11px] text-slate-400 block font-medium">CO2e Diverted</span>
                  <span className="text-lg font-bold text-pink-300">{savings.co2eSavedTons} Tons</span>
                </div>
              </div>

              <Link href="/role" className="block w-full">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-5 rounded-xl shadow-lg">
                  Start Saving Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Departments Supported Grid */}
      <section id="departments" className="py-20 px-4 md:px-8 bg-white">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge className="bg-purple-100 text-purple-700 border-purple-200 px-3 py-1 font-bold mb-3">
            Department Coverage
          </Badge>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
            Built for Every Corner of the Supermarket
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-12 text-sm md:text-base">
            From fresh perishables with 48-hour shelf lives to dry goods and household supplies, TrackIt provides
            tailored threshold configurations across all standard retail departments.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { name: 'Dairy & Eggs', icon: '🥛', desc: 'Milk, cheese, yogurt' },
              { name: 'Bakery', icon: '🍞', desc: 'Bread, pastries, rolls' },
              { name: 'Fresh Produce', icon: '🍎', desc: 'Fruits, vegetables' },
              { name: 'Meat & Seafood', icon: '🥩', desc: 'Poultry, beef, fish' },
              { name: 'Beverages', icon: '🧃', desc: 'Juices, water, sodas' },
              { name: 'Snacks & Sweets', icon: '🥨', desc: 'Chips, nuts, bars' },
              { name: 'Canned Goods', icon: '🥫', desc: 'Beans, soups, sauces' },
              { name: 'Frozen Foods', icon: '🧊', desc: 'Meals, vegetables, ice' },
              { name: 'Household', icon: '🧼', desc: 'Soaps, cleaning' },
              { name: 'Personal Care', icon: '🪥', desc: 'Toiletries, hygiene' },
            ].map((dept) => (
              <div
                key={dept.name}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-purple-300 hover:shadow-md transition-all text-center group"
              >
                <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">{dept.icon}</span>
                <h3 className="font-bold text-slate-800 text-sm">{dept.name}</h3>
                <p className="text-[11px] text-slate-500 mt-1">{dept.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Reliability & Security Trust Grid */}
      <section className="py-16 bg-slate-50 border-y border-slate-200/80 px-4 md:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200/60 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">ACID Data Safety</h4>
                <p className="text-xs text-slate-500">MongoDB replica set transactions</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200/60 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Sub-100ms Latency</h4>
                <p className="text-xs text-slate-500">Vercel Edge & Redis caching</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200/60 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Zero App Install</h4>
                <p className="text-xs text-slate-500">Full PWA mobile compatibility</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200/60 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">WCAG 2.1 AA</h4>
                <p className="text-xs text-slate-500">Accessibility audited & compliant</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (Accordion) */}
      <section id="faq" className="py-24 px-4 md:px-8 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 px-3 py-1 font-bold mb-3">
              Answers & Clarifications
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 mt-3 text-base md:text-lg">
              Everything you need to know about piloting TrackIt for your store or household.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-slate-200 overflow-hidden transition-all duration-200 bg-white"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="w-full p-6 text-left flex justify-between items-center gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    <span className="font-bold text-slate-900 text-base md:text-lg">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-purple-600 transition-transform duration-300 shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4 bg-slate-50/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* High-Impact Final CTA */}
      <section className="py-24 px-4 md:px-8 bg-gradient-to-tr from-purple-900 via-indigo-900 to-slate-950 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-at-c from-purple-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto max-w-4xl relative z-10">
          <Badge className="bg-pink-500/20 text-pink-300 border-pink-400/30 px-3 py-1 font-bold mb-4">
            Join the Food Waste Revolution
          </Badge>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            Ready to Stop Wasting Stock & Groceries?
          </h2>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Whether you run a 5,000-SKU supermarket or simply want to stop throwing out groceries at home,
            TrackIt is ready for you today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/administratorsignup" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-base px-8 py-6 rounded-2xl shadow-xl shadow-purple-500/30 hover:-translate-y-0.5 transition-all"
              >
                Register as Supermarket Admin
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/customersignup" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold text-base px-8 py-6 rounded-2xl hover:-translate-y-0.5 transition-all"
              >
                Create Free Consumer Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}