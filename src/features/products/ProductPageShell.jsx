'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, CheckCircle, Package } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/** Where the product pages return to (the admin dashboard's inventory tab). */
export const INVENTORY_URL = '/admin/dashboard?tab=inventory';

/** Inline success/error banner used instead of alert(). */
export function FormMessage({ type = 'error', title, children }) {
  const isError = type === 'error';
  const Icon = isError ? AlertCircle : CheckCircle;
  return (
    <Alert role={isError ? 'alert' : 'status'} className={isError ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}>
      <Icon className={isError ? 'h-4 w-4 text-red-600' : 'h-4 w-4 text-green-600'} aria-hidden="true" />
      <AlertTitle className={isError ? 'text-red-600' : 'text-green-600'}>{title ?? (isError ? 'Error' : 'Success')}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

/** Background, back link and card header shared by the add/edit product pages. */
export default function ProductPageShell({ title, description, actions, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-6" asChild>
          <Link href={INVENTORY_URL}>
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back to dashboard
          </Link>
        </Button>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Package className="h-8 w-8 text-purple-600" aria-hidden="true" />
                  <div>
                    <CardTitle className="text-2xl">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </div>
                </div>
                {actions}
              </div>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
