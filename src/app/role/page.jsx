'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Home, Store, User } from 'lucide-react';

export default function RoleSelection() {
  const roles = [
    {
      title: "Administrator",
      description: "Manage your supermarket inventory and track expiry dates",
      icon: <Store className="w-12 h-12 text-purple-600" />,
      href: "/administratorsignup",
      bgColor: "bg-purple-100",
      hoverColor: "hover:bg-purple-200"
    },
    {
      title: "Customer",
      description: "Track your purchases and receive expiry alerts",
      icon: <User className="w-12 h-12 text-purple-600" />,
      href: "/customersignup",
      bgColor: "bg-purple-50",
      hoverColor: "hover:bg-purple-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100 flex flex-col items-center justify-between p-4 sm:p-6">
      {/* Top Header with Return to Home button and TrackIt brand */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-950 bg-white/90 hover:bg-white border border-slate-200/90 shadow-xs backdrop-blur-sm transition-all group"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
          <span>Return to Home</span>
        </Link>

        <Link href="/home" className="flex items-center gap-2 group" aria-label="TrackIt Home">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
            T
          </div>
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
            TRACK<span className="text-purple-600">IT</span>
          </span>
        </Link>
      </header>

      <div className="w-full max-w-5xl mx-auto py-8 flex flex-col items-center justify-center flex-1">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">
            Select Your <span className="text-purple-600">Role</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto">
            Choose whether you&apos;re a supermarket administrator or a customer to set up your account
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto w-full">
          {roles.map((role, index) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="w-full"
            >
              <Card className={`h-full border border-gray-200 hover:border-purple-300 transition-all duration-300 shadow-sm hover:shadow-md ${role.bgColor} ${role.hoverColor}`}>
                <CardHeader className="items-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="p-4 bg-white rounded-full shadow-sm"
                  >
                    {role.icon}
                  </motion.div>
                  <CardTitle className="text-2xl text-gray-800 mt-4">
                    {role.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-center">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Link href={role.href} className="w-full">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                        Continue as {role.title}
                      </Button>
                    </motion.div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex flex-col items-center gap-2 text-sm text-gray-600"
        >
          <div>
            Already have an account?{' '}
            <Link href="/login" className="text-purple-600 font-semibold hover:text-purple-700 hover:underline">
              Login here
            </Link>
          </div>
          <Link
            href="/home"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-purple-700 transition-colors mt-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>
        </motion.div>
      </div>

      <footer className="w-full max-w-5xl mx-auto py-2 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} TrackIt. Retail Expiry Management & Automated Pantry System.
      </footer>
    </div>
  );
}