'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

/** Page shell shared by the login and sign-up screens. */
export default function AuthCard({ icon: Icon, title, description, footer, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        {/* Top bar with Return to Home button and TrackIt brand */}
        <div className="mb-4 flex items-center justify-between">
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
        </div>

        <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="text-center">
            <motion.div initial={{ y: -20 }} animate={{ y: 0 }} transition={{ delay: 0.2 }}>
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-purple-600" aria-hidden="true" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-gray-800">{title}</CardTitle>
            <CardDescription className="text-gray-600">{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
          <CardFooter className="flex flex-col items-center gap-2.5 pt-2 pb-5 border-t border-slate-100/90">
            {footer}
            <div className={footer ? "w-full pt-2 border-t border-slate-100 flex justify-center" : "w-full flex justify-center"}>
              <Link
                href="/home"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-purple-700 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Home</span>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

/** Inline success/error banner. */
export function AuthMessage({ type = 'error', children }) {
  const isError = type === 'error';
  const Icon = isError ? AlertCircle : CheckCircle2;
  return (
    <motion.div
      role={isError ? 'alert' : 'status'}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 p-3 rounded-md ${isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </motion.div>
  );
}
