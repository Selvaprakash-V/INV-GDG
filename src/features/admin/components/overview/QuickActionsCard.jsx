'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, BarChart2, FileBarChart, Package, Settings, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DASHBOARD_TABS, ROUTES } from '../../constants';

function Action({ children, ...props }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button {...props}>{children}</Button>
    </motion.div>
  );
}

export default function QuickActionsCard({ onTabChange }) {
  const router = useRouter();
  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="bg-gradient-to-r from-violet-50 to-indigo-50 border-b border-violet-100">
        <CardTitle className="flex items-center text-violet-800">
          <Settings className="mr-2 h-5 w-5 text-violet-600" aria-hidden="true" />
          Quick Actions
        </CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-4">
          <Action
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 h-12"
            onClick={() => router.push(ROUTES.ADD_PRODUCT)}
          >
            <Package className="mr-2 h-5 w-5" aria-hidden="true" />
            Add New Product
          </Action>
          <Action
            variant="outline"
            className="w-full h-12 border-purple-200 hover:bg-purple-50"
            onClick={() => router.push(ROUTES.RECORD_SALE)}
          >
            <ShoppingCart className="mr-2 h-5 w-5 text-purple-600" aria-hidden="true" />
            Record a Sale
          </Action>
          <Action
            variant="outline"
            className="w-full h-12 border-purple-200 hover:bg-purple-50"
            onClick={() => onTabChange(DASHBOARD_TABS.INVENTORY)}
          >
            <BarChart2 className="mr-2 h-5 w-5 text-purple-600" aria-hidden="true" />
            View Full Inventory
          </Action>
          <Action
            variant="outline"
            className="w-full h-12 border-orange-200 hover:bg-orange-50"
            onClick={() => onTabChange(DASHBOARD_TABS.ALERTS)}
          >
            <AlertCircle className="mr-2 h-5 w-5 text-orange-600" aria-hidden="true" />
            Check Expiry Alerts
          </Action>
          <Action
            variant="outline"
            className="w-full h-12 border-blue-200 hover:bg-blue-50"
            onClick={() => onTabChange(DASHBOARD_TABS.REPORTS)}
          >
            <FileBarChart className="mr-2 h-5 w-5 text-blue-600" aria-hidden="true" />
            View Sales Reports
          </Action>
        </div>
      </CardContent>
    </Card>
  );
}
