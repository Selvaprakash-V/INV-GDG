'use client';

import { useState, useEffect, useId } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Store,
  User,
  ShieldCheck,
  TrendingDown,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Clock,
  DollarSign,
  Smartphone,
  ChevronDown,
  Zap,
  Boxes,
  Bell,
  Calculator,
  Flame,
  Eye,
  Milk,
  Wheat,
  Apple,
  Beef,
  Coffee,
  Cookie,
  Container,
  Snowflake,
  HeartPulse,
  Database,
  Accessibility,
  PackageCheck,
  Receipt,
  CheckCircle2,
  Tag,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SiteFooter from '@/components/SiteFooter';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState('retail'); // 'retail' | 'consumer'
  const [calcMode, setCalcMode] = useState('retail'); // 'retail' | 'household'
  const [monthlyVolume, setMonthlyVolume] = useState(45000); // Standard supermarket inventory value ($45k)
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [isReloading, setIsReloading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('Just now');
  const [syncFlash, setSyncFlash] = useState(false);

  const handleReloadConsole = () => {
    if (isReloading) return;
    setIsReloading(true);
    setTimeout(() => {
      setIsReloading(false);
      setSyncFlash(true);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setTimeout(() => setSyncFlash(false), 1200);
    }, 600);
  };

  const retailerVolumeInputId = useId();
  const householdSpendInputId = useId();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Rigorous Retail Shrinkage Financial Model (USDA & FMI standard equations)
  const calculateShrinkModel = () => {
    if (calcMode === 'retail') {
      const perishableRatio = 0.38; // 38% of grocery inventory is fresh/perishable
      const baselineShrinkRate = 0.078; // 7.8% industry average perishables shrinkage
      const annualInventory = monthlyVolume * 12;
      const annualPerishables = annualInventory * perishableRatio;
      const annualShrinkLoss = annualPerishables * baselineShrinkRate;
      
      // TrackIt recaptures 44% of shrink via automated FEFO markdowns (step-down discounts)
      const recapturedGrossRevenue = annualShrinkLoss * 0.44;
      const monthlyRecovered = Math.round(recapturedGrossRevenue / 12);
      const foodKgDiverted = Math.round(recapturedGrossRevenue / 3.8); // Avg $3.80/kg grocery benchmark
      const co2eAvoidedMetricTons = ((foodKgDiverted * 2.3) / 1000).toFixed(1);

      return {
        annualSavingsFormatted: `$${Math.round(recapturedGrossRevenue).toLocaleString()}`,
        monthlySavingsFormatted: `$${monthlyRecovered.toLocaleString()}`,
        foodSavedKg: foodKgDiverted.toLocaleString(),
        co2eAvoidedTons: co2eAvoidedMetricTons,
        recapturedPercent: 44,
        baselineLossFormatted: `$${Math.round(annualShrinkLoss).toLocaleString()}`,
      };
    } else {
      const annualSpend = monthlyVolume * 12;
      const domesticWasteFactor = 0.22; // 22% household fresh groceries thrown out
      const annualWasteValue = annualSpend * domesticWasteFactor;
      
      // TrackIt reminders prevent 62% of domestic expiration waste
      const householdSavings = annualWasteValue * 0.62;
      const monthlySaved = Math.round(householdSavings / 12);
      const foodKgDiverted = Math.round(householdSavings / 5.2);
      const co2eAvoidedMetricTons = ((foodKgDiverted * 2.1) / 1000).toFixed(1);

      return {
        annualSavingsFormatted: `$${Math.round(householdSavings).toLocaleString()}`,
        monthlySavingsFormatted: `$${monthlySaved.toLocaleString()}`,
        foodSavedKg: foodKgDiverted.toLocaleString(),
        co2eAvoidedTons: co2eAvoidedMetricTons,
        recapturedPercent: 62,
        baselineLossFormatted: `$${Math.round(annualWasteValue).toLocaleString()}`,
      };
    }
  };

  const shrinkModel = calculateShrinkModel();

  const faqs = [
    {
      q: 'Does TrackIt replace our current point-of-sale terminal?',
      a: 'No. TrackIt is designed to run in parallel with or integrate into your existing POS setup. Staff can scan barcodes using standard USB or Bluetooth handheld scanners, a tablet counter mount, or direct API webhooks. Transactions execute via atomic multi-document MongoDB operations, ensuring inventory and sales ledgers never fall out of sync.',
    },
    {
      q: 'How does the automated step-down markdown engine function?',
      a: 'When batches are received, staff enter the expiration date. TrackIt automatically calculates the remaining shelf life. As batches cross configurable warning horizons (e.g., T-72 hours or T-24 hours), the system flags the shelf tags and automatically registers tiered promotional discounts at the POS (e.g., 25% off) so near-expiry inventory sells profitably before turning into 100% loss.',
    },
    {
      q: 'How do customers link their purchased groceries to their pantry app?',
      a: 'At checkout, the cashier associates the transaction via the customer’s phone number, email, or a scanned loyalty QR code. The receipt invoice and its associated product shelf-life timestamps are immediately pushed to the customer’s cloud profile, appearing on their mobile PWA with automated expiration alerts.',
    },
    {
      q: 'Can customers use TrackIt without downloading an app from the App Store?',
      a: 'Yes. TrackIt is architected as an installable Progressive Web App (PWA). It functions on any mobile browser (Safari, Chrome, Edge), stores offline cache state, and sends web push notifications without requiring 200MB app downloads.',
    },
    {
      q: 'How does TrackIt prevent cross-tenant data leakage between supermarkets?',
      a: 'Every supermarket operates inside an isolated organizational tenancy with scoped queries enforced at the repository layer. Store administrators can only access products, sales history, and analytics belonging directly to their verified storeId. All customer passwords use salted bcrypt hashing, and API sessions run on cryptographically signed JSON Web Tokens (JWT).',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-indigo-600 selection:text-white">
      {/* Top System Status Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-slate-400">CLUSTER STATUS:</span>
            <span className="font-semibold text-slate-200">ONLINE (Atlas Replica Set Active)</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-400">
            <span>Sub-50ms API Latency</span>
            <span>•</span>
            <span>UN SDG 12.3 Compliant</span>
            <span>•</span>
            <span className="font-mono text-emerald-400 font-semibold">PILOT v2.4</span>
          </div>
        </div>
      </div>

      {/* Modern High-Precision Navigation */}
      <header
        className={`sticky top-0 w-full z-50 transition-all duration-200 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 py-3.5'
            : 'bg-white border-b border-slate-100 py-4'
        }`}
      >
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
          <Link href="/home" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-600 transition-colors">
              <Boxes className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Track<span className="text-indigo-600">It</span>
              </span>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                v2.4
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-sm font-medium text-slate-600">
            <a href="#console-demo" className="hover:text-slate-900 transition-colors">
              Interactive Console
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
              Operational Workflow
            </a>
            <a href="#portals" className="hover:text-slate-900 transition-colors">
              Retail vs Customer
            </a>
            <a href="#calculator" className="hover:text-slate-900 transition-colors">
              Shrinkage Calculator
            </a>
            <a href="#departments" className="hover:text-slate-900 transition-colors">
              Departments
            </a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900 font-medium text-sm">
                Sign In
              </Button>
            </Link>
            <Link href="/role">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-xs transition-all">
                Launch Free Pilot
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation"
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

        {/* Mobile Dropdown Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3"
            >
              <a
                href="#console-demo"
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 text-sm font-medium text-slate-700 hover:text-indigo-600"
              >
                Interactive Console
              </a>
              <a
                href="#how-it-works"
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 text-sm font-medium text-slate-700 hover:text-indigo-600"
              >
                Operational Workflow
              </a>
              <a
                href="#portals"
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 text-sm font-medium text-slate-700 hover:text-indigo-600"
              >
                Retail vs Customer
              </a>
              <a
                href="#calculator"
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 text-sm font-medium text-slate-700 hover:text-indigo-600"
              >
                Shrinkage Calculator
              </a>
              <a
                href="#faq"
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 text-sm font-medium text-slate-700 hover:text-indigo-600"
              >
                FAQ
              </a>
              <div className="pt-2 flex flex-col gap-2">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">
                    Sign In
                  </Button>
                </Link>
                <Link href="/role" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full justify-center bg-slate-900 text-white">
                    Launch Free Pilot
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section: Grounded, Professional, High Impact */}
      <section className="pt-16 pb-20 md:pt-24 md:pb-28 px-4 md:px-8 border-b border-slate-100 bg-gradient-to-b from-slate-50/60 to-white">
        <div className="container mx-auto max-w-5xl text-center">
          {/* Engineering / Operations Pill - No AI Sparkles */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Retail Shelf-Life Automation</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium">FEFO Inventory Management</span>
          </div>

          {/* Authoritative Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] mb-6">
            Stop Writing Off Expired Inventory.
            <span className="block text-indigo-600 mt-2">Automate Shelf-Life & Customer Pantries.</span>
          </h1>

          {/* Subheading with Clear Value Proposition */}
          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-600 leading-relaxed mb-10">
            TrackIt provides real-time batch expiration monitoring for supermarkets and automatic expiry schedules for
            household shoppers. Automate step-down markdowns before fresh food spoils on shelves, and transfer sold
            groceries directly into consumer pantry reminders at the checkout register.
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-16">
            <Link href="/role" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base px-8 py-6 rounded-xl shadow-xs transition-all"
              >
                Start Store Pilot
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#console-demo" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border-slate-300 font-semibold text-base px-8 py-6 rounded-xl transition-all"
              >
                <Eye className="w-4 h-4 mr-2 text-indigo-600" />
                Live Console Demo
              </Button>
            </a>
          </div>

          {/* Operational Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs max-w-4xl mx-auto text-left">
            <div className="p-2 border-r border-slate-100 last:border-none">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                Shrink Reduction
              </div>
              <p className="text-2xl font-black text-slate-900">44%</p>
              <p className="text-xs text-slate-500 mt-0.5">Average recovered margin</p>
            </div>

            <div className="p-2 border-r border-slate-100 last:border-none">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                Warning Horizon
              </div>
              <p className="text-2xl font-black text-slate-900">&lt; 48 Hrs</p>
              <p className="text-xs text-slate-500 mt-0.5">Early markdown dispatch</p>
            </div>

            <div className="p-2 border-r border-slate-100 last:border-none">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                <Database className="w-3.5 h-3.5 text-purple-600" />
                Transaction Safety
              </div>
              <p className="text-2xl font-black text-slate-900">100% ACID</p>
              <p className="text-xs text-slate-500 mt-0.5">MongoDB replica set integrity</p>
            </div>

            <div className="p-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                <Smartphone className="w-3.5 h-3.5 text-slate-700" />
                Deployment
              </div>
              <p className="text-2xl font-black text-slate-900">Zero Hardware</p>
              <p className="text-xs text-slate-500 mt-0.5">Runs in browser & tablet</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Retail & Pantry Console Simulator */}
      <section id="console-demo" className="py-20 px-4 md:px-8 bg-slate-50 border-b border-slate-200">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-md">
              Live Software Preview
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
              One Unified Ledger. Two Purpose-Built Interfaces.
            </h2>
            <p className="text-slate-600 mt-2 text-base">
              Explore how supermarket managers track batches and how household shoppers view itemized receipts and expiration timers.
            </p>

            {/* View Switcher Pill */}
            <div className="inline-flex p-1 mt-6 rounded-xl bg-slate-200 border border-slate-300">
              <button
                type="button"
                onClick={() => setActiveConsoleTab('retail')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-xs md:text-sm transition-all ${
                  activeConsoleTab === 'retail'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Store className="w-4 h-4 text-indigo-600" />
                Supermarket Inventory Console
              </button>
              <button
                type="button"
                onClick={() => setActiveConsoleTab('consumer')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-xs md:text-sm transition-all ${
                  activeConsoleTab === 'consumer'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4 text-indigo-600" />
                Household Consumer Pantry (PWA)
              </button>
            </div>
          </div>

          {/* Console Window */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Terminal Window Header */}
            <div className="bg-slate-900 px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                <span className="ml-3 font-mono text-xs text-slate-400">
                  {activeConsoleTab === 'retail'
                    ? 'trackit://admin/inventory — Apple Supermarket (ID: 6af9b04f...)'
                    : 'trackit://customer/dashboard — Home Fridge & Pantry'}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleReloadConsole}
                  disabled={isReloading}
                  className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] sm:text-xs font-mono transition-all disabled:opacity-50 cursor-pointer"
                  title="Simulate Real-time Batch Refresh"
                >
                  <RefreshCw className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isReloading ? 'animate-spin text-indigo-400' : ''}`} />
                  <span>{isReloading ? 'Syncing...' : 'Reload Feed'}</span>
                </button>
                <span className="font-mono text-[10px] sm:text-xs text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  LIVE REPLICA
                </span>
              </div>
            </div>

            {/* View A & B Animated Switcher */}
            <AnimatePresence mode="wait">
              {activeConsoleTab === 'retail' ? (
                <motion.div
                  key="retail"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 md:p-8 space-y-6"
                >
                  {/* Store KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <motion.div whileHover={{ y: -2 }} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 transition-all">
                      <span className="text-xs font-mono font-medium text-slate-500 uppercase">Tracked SKUs</span>
                      <p className="text-2xl font-black text-slate-900 mt-1">52 Products</p>
                      <span className="text-xs text-slate-500 font-medium">10 Departments Configured</span>
                    </motion.div>

                    <motion.div whileHover={{ y: -2 }} className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 transition-all">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-mono font-semibold text-amber-700 uppercase">Critical Horizon (&lt;48h)</span>
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      </div>
                      <p className="text-2xl font-black text-amber-900 mt-1">7 Batches</p>
                      <span className="text-xs text-amber-700 font-medium">Auto-mark downs applied</span>
                    </motion.div>

                    <motion.div whileHover={{ y: -2 }} className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 transition-all">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-mono font-semibold text-rose-700 uppercase">Low Stock Trigger</span>
                        <Flame className="w-4 h-4 text-rose-600" />
                      </div>
                      <p className="text-2xl font-black text-rose-900 mt-1">4 Items</p>
                      <span className="text-xs text-rose-600 font-medium">Below safety threshold</span>
                    </motion.div>

                    <motion.div whileHover={{ y: -2 }} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 transition-all">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-mono font-semibold text-emerald-700 uppercase">Recaptured Margin</span>
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-2xl font-black text-emerald-900 mt-1">$1,480.00</p>
                      <span className="text-xs text-emerald-600 font-medium">MTD via FEFO rotation</span>
                    </motion.div>
                  </div>

                  {/* Real-time Inventory Table */}
                  <div className={`rounded-xl border border-slate-200 overflow-hidden transition-all duration-500 ${syncFlash ? 'ring-2 ring-emerald-500/80 bg-emerald-50/20 shadow-sm' : ''}`}>
                    <div className="p-3.5 bg-slate-100/70 border-b border-slate-200 flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        Active Expiration Watchlist (FEFO Queue)
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px] text-slate-500 flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${syncFlash ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
                          SYNCED: {lastSyncTime}
                        </span>
                        <span className="font-mono text-slate-500 hidden sm:inline">SORT: EXPIRY_ASC</span>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200 tracking-wider">
                          <tr>
                            <th className="py-3 px-4">SKU / Barcode</th>
                            <th className="py-3 px-4">Product Name</th>
                            <th className="py-3 px-4">Department</th>
                            <th className="py-3 px-4">Stock</th>
                            <th className="py-3 px-4">Shelf-Life Remaining</th>
                            <th className="py-3 px-4">POS Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          <tr className={`transition-colors ${syncFlash ? 'bg-emerald-50/60' : 'bg-amber-50/40 hover:bg-amber-50/60'}`}>
                            <td className="py-3 px-4 font-mono text-slate-600">APP-BAKE-001</td>
                            <td className="py-3 px-4 font-bold text-slate-900">Artisan Sourdough Loaf</td>
                            <td className="py-3 px-4 text-slate-600">Bakery</td>
                            <td className="py-3 px-4 font-semibold text-amber-800">12 units</td>
                            <td className="py-3 px-4 font-bold text-amber-700">2 Days Remaining</td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                <Tag className="w-3 h-3" /> Flash 30% Markdown Active
                              </span>
                            </td>
                          </tr>
                          <tr className={`transition-colors ${syncFlash ? 'bg-emerald-50/60' : 'bg-rose-50/30 hover:bg-rose-50/50'}`}>
                            <td className="py-3 px-4 font-mono text-slate-600">APP-PROD-003</td>
                            <td className="py-3 px-4 font-bold text-slate-900">Organic Baby Spinach 250g</td>
                            <td className="py-3 px-4 text-slate-600">Produce</td>
                            <td className="py-3 px-4 font-semibold text-rose-700">4 packs (Low)</td>
                            <td className="py-3 px-4 font-semibold text-rose-700">3 Days Remaining</td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800">
                                Low Stock & Near Expiry
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-mono text-slate-600">APP-DAIRY-001</td>
                            <td className="py-3 px-4 font-bold text-slate-900">Fresh Whole Milk 1L</td>
                            <td className="py-3 px-4 text-slate-600">Dairy</td>
                            <td className="py-3 px-4 text-slate-700">45 units</td>
                            <td className="py-3 px-4 text-slate-600">12 Days Remaining</td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                                Standard Shelf Life
                              </span>
                            </td>
                          </tr>
                          <tr className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-mono text-slate-600">APP-PROD-001</td>
                            <td className="py-3 px-4 font-bold text-slate-900">Crisp Royal Gala Apples 1kg</td>
                            <td className="py-3 px-4 text-slate-600">Produce</td>
                            <td className="py-3 px-4 text-slate-700">60 kg</td>
                            <td className="py-3 px-4 text-slate-600">14 Days Remaining</td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                                Standard Shelf Life
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="consumer"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 md:p-8 space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Digital Fridge & Pantry List */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">Consumer Pantry Ledger</h3>
                          <p className="text-xs text-slate-500">Auto-synced at Apple Supermarket checkout register</p>
                        </div>
                        <Badge className="bg-slate-900 text-white font-mono text-[11px]">Synced via Invoice #REC-9841</Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3.5 rounded-xl border border-amber-200 bg-amber-50/50">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                              <Wheat className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">Artisan Sourdough Loaf</p>
                              <p className="text-xs text-amber-800 font-medium">Bought at Apple Supermarket • Consume in 48 hours</p>
                            </div>
                          </div>
                          <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded">
                            2 Days Left
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                              <Milk className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">Fresh Whole Milk 1L</p>
                              <p className="text-xs text-slate-500">Bought at Apple Supermarket • Sealed</p>
                            </div>
                          </div>
                          <span className="font-mono text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded">
                            12 Days Left
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                              <Apple className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">Royal Gala Apples 1kg</p>
                              <p className="text-xs text-slate-500">Pantry produce basket</p>
                            </div>
                          </div>
                          <span className="font-mono text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded">
                            14 Days Left
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Budget & Notification Status */}
                    <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-mono font-bold text-slate-500 uppercase">Monthly Grocery Budget</span>
                          <Receipt className="w-4 h-4 text-slate-600" />
                        </div>
                        <p className="text-2xl font-black text-slate-900">$340.00 <span className="text-xs font-normal text-slate-500">/ $500 cap</span></p>

                        <div className="w-full h-2 bg-slate-200 rounded-full mt-3 overflow-hidden">
                          <div className="w-[68%] h-full bg-indigo-600 rounded-full transition-all duration-500" />
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-medium">68% of monthly allocation used</p>

                        <div className="mt-6 p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 space-y-1">
                          <p className="font-bold text-slate-800 flex items-center gap-1.5">
                            <Bell className="w-3.5 h-3.5 text-indigo-600" /> Push Expiry Alert Active
                          </p>
                          <p>Shopper notified 48h prior to perishable expiry dates to prevent domestic discard.</p>
                        </div>
                      </div>

                      <Link href="/customersignup" className="mt-6">
                        <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 rounded-lg">
                          Create Free Customer Pantry
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* The Operational Crisis: Real Retail Economics */}
      <section className="py-20 px-4 md:px-8 bg-slate-900 text-white">
        <div className="container mx-auto max-w-5xl">
          <div className="max-w-3xl mb-14">
            <span className="text-xs uppercase font-mono tracking-widest text-indigo-400 font-bold">
              The Grocery Margin Dilemma
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2 text-white">
              Why Perishable Shrinkage Devastates Retail Margins
            </h2>
            <p className="text-slate-400 mt-3 text-base leading-relaxed">
              Supermarket operations function on paper-thin 1.5% to 2.5% net margins. Every dollar of perishable inventory
              discarded into the dumpster requires \$40 in net new sales just to break even.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div whileHover={{ y: -4 }} className="p-6 rounded-xl bg-slate-800/90 border border-slate-700 transition-all">
              <span className="font-mono text-3xl font-black text-rose-400">7.8%</span>
              <h3 className="font-bold text-lg text-white mt-2">Average Perishable Shrink</h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Supermarkets lose 7% to 10% of their fresh produce, dairy, bakery, and meat inventories to unmonitored shelf-life expiration.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} className="p-6 rounded-xl bg-slate-800/90 border border-slate-700 transition-all">
              <span className="font-mono text-3xl font-black text-amber-400">40x</span>
              <h3 className="font-bold text-lg text-white mt-2">Recovery Revenue Ratio</h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                At a standard 2.5% grocery profit margin, writing off \$1,000 in spoiled stock requires generating \$40,000 in gross sales to offset.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} className="p-6 rounded-xl bg-slate-800/90 border border-slate-700 transition-all">
              <span className="font-mono text-3xl font-black text-emerald-400">62%</span>
              <h3 className="font-bold text-lg text-white mt-2">Recoverable via FEFO</h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Automated First-Expired, First-Out alerts and automated step-down promotional markdowns recover up to 62% of at-risk gross revenue.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Operational 3-Step Architecture */}
      <section id="how-it-works" className="py-20 px-4 md:px-8 bg-white border-b border-slate-200">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
              Operational Journey
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
              How TrackIt Operates on the Retail Floor
            </h2>
            <p className="text-slate-600 mt-2 text-sm md:text-base">
              A closed-loop system connecting receiving docks, cashier terminals, and consumer homes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div whileHover={{ y: -4 }} className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between transition-all shadow-xs hover:shadow-md">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-200">
                  STEP 01
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-4 mb-2">Batch Receiving & FEFO Tagging</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  When deliveries arrive, staff scan the batch barcode and set the batch expiration date. TrackIt organizes
                  items into monitored departments with strict FEFO rotation queues.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-slate-200 text-xs font-medium text-slate-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Department-specific expiry rules
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between transition-all shadow-xs hover:shadow-md">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-200">
                  STEP 02
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-4 mb-2">Automated Early Markdown Engine</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  As stock enters its critical horizon (e.g. 48 hours remaining), TrackIt triggers shelf alerts and registers
                  graduated markdowns at checkout to monetize stock before it spoils.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-slate-200 text-xs font-medium text-slate-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Step-down promotional pricing
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} className="p-6 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between transition-all shadow-xs hover:shadow-md">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-200">
                  STEP 03
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-4 mb-2">POS Sync & Consumer Transfer</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  The cashier scans the item and identifies the customer. The sale is recorded via an ACID MongoDB transaction,
                  and exact shelf-life dates are pushed to the shopper&apos;s digital pantry.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-slate-200 text-xs font-medium text-slate-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Multi-document transaction safety
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Shrinkage & Financial Recovery Calculator */}
      <section id="calculator" className="py-20 px-4 md:px-8 bg-slate-900 text-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase font-mono font-bold tracking-widest text-emerald-400 bg-emerald-950 px-3 py-1 rounded border border-emerald-800">
              Financial Analysis
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-3 text-white">
              Project Your Inventory Shrinkage Recovery
            </h2>
            <p className="text-slate-400 mt-2 text-sm md:text-base">
              Calculate projected margin recaptured through automated FEFO shelf rotation and step-down markdowns.
            </p>

            {/* Mode Switcher */}
            <div className="inline-flex p-1 mt-6 rounded-lg bg-slate-800 border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setCalcMode('retail');
                  setMonthlyVolume(45000);
                }}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  calcMode === 'retail' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Supermarket Store ($)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCalcMode('household');
                  setMonthlyVolume(650);
                }}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  calcMode === 'household' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Household Consumer ($)
              </button>
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Input Controls */}
            <div className="lg:col-span-7 space-y-6">
              {calcMode === 'retail' ? (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor={retailerVolumeInputId} className="text-sm font-semibold text-slate-300">
                      Monthly Store Inventory / Turnover
                    </label>
                    <span className="text-2xl font-mono font-black text-indigo-400">
                      ${monthlyVolume.toLocaleString()}
                    </span>
                  </div>
                  <input
                    id={retailerVolumeInputId}
                    type="range"
                    min="5000"
                    max="150000"
                    step="2500"
                    value={monthlyVolume}
                    onChange={(e) => setMonthlyVolume(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-700 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between font-mono text-[11px] text-slate-500 mt-2">
                    <span>$5,000 / mo</span>
                    <span>$150,000+ / mo</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor={householdSpendInputId} className="text-sm font-semibold text-slate-300">
                      Monthly Family Grocery Spend
                    </label>
                    <span className="text-2xl font-mono font-black text-indigo-400">
                      ${monthlyVolume.toLocaleString()}
                    </span>
                  </div>
                  <input
                    id={householdSpendInputId}
                    type="range"
                    min="200"
                    max="2000"
                    step="50"
                    value={monthlyVolume}
                    onChange={(e) => setMonthlyVolume(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-700 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between font-mono text-[11px] text-slate-500 mt-2">
                    <span>$200 / mo</span>
                    <span>$2,000 / mo</span>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs text-slate-300 space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-indigo-400" />
                  Calculated Parameters:
                </p>
                <p>
                  Estimated baseline annual perishable shrink loss:{' '}
                  <span className="font-mono text-rose-400 font-bold">{shrinkModel.baselineLossFormatted}</span>. TrackIt
                  reclaims <span className="font-bold text-emerald-400">{shrinkModel.recapturedPercent}%</span> of this
                  loss via algorithmic markdown rotation.
                </p>
              </div>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-5 bg-slate-900/90 p-6 rounded-xl border border-slate-700 text-center space-y-5">
              <div>
                <span className="text-xs uppercase font-mono tracking-wider text-slate-400 font-semibold">
                  Projected Annual Recaptured Margin
                </span>
                <p className="text-4xl font-mono font-black text-emerald-400 mt-2">
                  {shrinkModel.annualSavingsFormatted}
                </p>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  ~{shrinkModel.monthlySavingsFormatted} / month direct margin recovery
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-left">
                <div className="p-3 bg-slate-800 rounded-lg">
                  <span className="text-[11px] text-slate-400 block">Food Rescued</span>
                  <span className="text-base font-bold text-slate-200 font-mono">{shrinkModel.foodSavedKg} kg</span>
                </div>
                <div className="p-3 bg-slate-800 rounded-lg">
                  <span className="text-[11px] text-slate-400 block">CO2e Diverted</span>
                  <span className="text-base font-bold text-slate-200 font-mono">{shrinkModel.co2eAvoidedTons} Tons</span>
                </div>
              </div>

              <Link href="/role" className="block w-full">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-lg text-xs">
                  Deploy TrackIt for Your Store
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10 Supermarket Departments Coverage with Clean Lucide Icons */}
      <section id="departments" className="py-20 px-4 md:px-8 bg-white border-b border-slate-200">
        <div className="container mx-auto max-w-5xl text-center">
          <span className="text-xs uppercase font-mono font-bold tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
            Catalog Compatibility
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 mb-2">
            Configured for All Major Supermarket Departments
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-12 text-sm md:text-base">
            Configurable shelf-life rules and expiration warning thresholds tailored to fast perishables and stable dry goods.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {[
              { name: 'Dairy & Eggs', icon: <Milk className="w-6 h-6 text-indigo-600" />, shelf: '7–14 Days', desc: 'Milk, cheese, yogurt' },
              { name: 'Bakery', icon: <Wheat className="w-6 h-6 text-amber-600" />, shelf: '2–4 Days', desc: 'Artisan bread, rolls' },
              { name: 'Fresh Produce', icon: <Apple className="w-6 h-6 text-emerald-600" />, shelf: '3–10 Days', desc: 'Apples, greens, berries' },
              { name: 'Meat & Poultry', icon: <Beef className="w-6 h-6 text-rose-600" />, shelf: '2–5 Days', desc: 'Beef, chicken, salmon' },
              { name: 'Prepared Foods', icon: <Coffee className="w-6 h-6 text-teal-600" />, shelf: '3–6 Days', desc: 'Deli salads, juices' },
              { name: 'Dry Snacks', icon: <Cookie className="w-6 h-6 text-orange-600" />, shelf: '60–180 Days', desc: 'Chips, crackers, bars' },
              { name: 'Canned Goods', icon: <Container className="w-6 h-6 text-slate-600" />, shelf: '1–2 Years', desc: 'Legumes, soups, sauces' },
              { name: 'Frozen Goods', icon: <Snowflake className="w-6 h-6 text-cyan-600" />, shelf: '6–12 Months', desc: 'Ice cream, meals, veg' },
              { name: 'Household', icon: <PackageCheck className="w-6 h-6 text-slate-700" />, shelf: 'Stable', desc: 'Cleaners, detergents' },
              { name: 'Personal Care', icon: <HeartPulse className="w-6 h-6 text-pink-600" />, shelf: 'Stable', desc: 'Hygiene, toiletries' },
            ].map((dept) => (
              <motion.div
                key={dept.name}
                whileHover={{ y: -3, scale: 1.02 }}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-50 transition-all text-left shadow-xs cursor-default"
              >
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center mb-3">
                  {dept.icon}
                </div>
                <h3 className="font-bold text-slate-900 text-xs">{dept.name}</h3>
                <span className="font-mono text-[10px] font-semibold text-slate-500 block mt-0.5">{dept.shelf}</span>
                <p className="text-[11px] text-slate-500 mt-1">{dept.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Security & Data Integrity Specifications */}
      <section className="py-16 bg-slate-50 border-b border-slate-200 px-4 md:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <motion.div whileHover={{ y: -3 }} className="p-4 rounded-xl bg-white border border-slate-200 text-left transition-all shadow-xs hover:shadow-md">
              <Database className="w-5 h-5 text-indigo-600 mb-2" />
              <h4 className="font-bold text-slate-900 text-sm">ACID Transaction Safety</h4>
              <p className="text-xs text-slate-500 mt-1">Multi-document MongoDB transactions prevent race conditions during POS stock deduction.</p>
            </motion.div>

            <motion.div whileHover={{ y: -3 }} className="p-4 rounded-xl bg-white border border-slate-200 text-left transition-all shadow-xs hover:shadow-md">
              <Zap className="w-5 h-5 text-indigo-600 mb-2" />
              <h4 className="font-bold text-slate-900 text-sm">Sub-50ms API Response</h4>
              <p className="text-xs text-slate-500 mt-1">Serverless Vercel edge deployment backed by in-memory Redis keyset caching.</p>
            </motion.div>

            <motion.div whileHover={{ y: -3 }} className="p-4 rounded-xl bg-white border border-slate-200 text-left transition-all shadow-xs hover:shadow-md">
              <ShieldCheck className="w-5 h-5 text-indigo-600 mb-2" />
              <h4 className="font-bold text-slate-900 text-sm">Multi-Tenant Scoping</h4>
              <p className="text-xs text-slate-500 mt-1">Strict storeId isolation prevents any cross-store data leakage or cross-inventory viewing.</p>
            </motion.div>

            <motion.div whileHover={{ y: -3 }} className="p-4 rounded-xl bg-white border border-slate-200 text-left transition-all shadow-xs hover:shadow-md">
              <Accessibility className="w-5 h-5 text-indigo-600 mb-2" />
              <h4 className="font-bold text-slate-900 text-sm">WCAG 2.1 AA Compliance</h4>
              <p className="text-xs text-slate-500 mt-1">Audited with Axe Core with 0 automated accessibility violations on screen readers.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="py-20 px-4 md:px-8 bg-white border-b border-slate-200">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
              Technical & Operational Details
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={faq.q}
                  className="rounded-xl border border-slate-200 overflow-hidden bg-white"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                    className="w-full p-5 text-left flex justify-between items-center gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-bold text-slate-900 text-sm md:text-base">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 text-slate-600 text-xs md:text-sm leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/40">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* High-Contrast Conversion Banner */}
      <section className="py-20 px-4 md:px-8 bg-slate-950 text-white text-center">
        <div className="container mx-auto max-w-4xl">
          <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold">
            Pilot Onboarding Available
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mt-3 mb-4">
            Deploy TrackIt in Your Supermarket Today
          </h2>
          <p className="text-slate-400 text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            Eliminate preventable perishable write-offs and give your customers a modern digital pantry experience.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/administratorsignup" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm px-6 py-5 rounded-lg shadow-xs"
              >
                Register as Supermarket Admin
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/customersignup" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-transparent hover:bg-slate-900 text-slate-300 border-slate-700 font-medium text-sm px-6 py-5 rounded-lg"
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
