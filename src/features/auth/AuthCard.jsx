'use client';

import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

/** Page shell shared by the login and sign-up screens. */
export default function AuthCard({ icon: Icon, title, description, footer, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
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
          {footer && <CardFooter className="flex flex-col items-center gap-2">{footer}</CardFooter>}
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
