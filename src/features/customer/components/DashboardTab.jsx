'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, History, IndianRupee, PackageOpen, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AsyncSection, EmptyState, ErrorState, LoadingState } from './SectionState';
import SpendingCard from './SpendingCard';
import PurchaseCard from './PurchaseCard';
import ExpiryItemRow from './ExpiryItemRow';
import { TABS } from '../tabs';

const RECENT_PURCHASES_PREVIEW = 2;
const EXPIRY_PREVIEW = 4;

function SpendingOverview({ spending, budget }) {
  if (spending.loading) return <LoadingState label="Loading spending…" />;
  if (spending.error) {
    return <ErrorState error={spending.error} onRetry={spending.refetch} message="Could not load your spending." />;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SpendingCard
        icon={IndianRupee}
        title="Monthly Spending"
        description="Total purchases this month"
        period={spending.data?.currentMonth}
        periodLabel="month"
        budget={budget.monthly}
        direction="left"
        delay={0.1}
      />
      <SpendingCard
        icon={ShoppingBag}
        title="Weekly Spending"
        description="Total purchases this week"
        period={spending.data?.currentWeek}
        periodLabel="week"
        budget={budget.weekly}
        direction="right"
        delay={0.2}
      />
    </div>
  );
}

function RecentPurchases({ purchases, onViewAll }) {
  const recent = purchases.purchases.slice(0, RECENT_PURCHASES_PREVIEW);
  return (
    <Card className="bg-white border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <History className="mr-3 h-6 w-6" aria-hidden="true" />
          Recent Purchases
        </CardTitle>
        <CardDescription className="text-lg">Your most recent transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <AsyncSection loading={purchases.loading} error={purchases.error} onRetry={purchases.refetch}>
          {recent.length === 0 ? (
            <EmptyState icon={PackageOpen} title="No purchases yet" description="Purchases recorded by a store will appear here." />
          ) : (
            <div className="space-y-6">
              {recent.map((purchase) => (
                <PurchaseCard key={purchase.id} purchase={purchase} />
              ))}
            </div>
          )}
        </AsyncSection>
      </CardContent>
      <CardFooter className="justify-center border-t pt-6">
        <Button variant="ghost" className="text-purple-600 text-lg" onClick={onViewAll}>
          View All Purchases
        </Button>
      </CardFooter>
    </Card>
  );
}

function ExpiryPreview({ expiring, onViewAll }) {
  const preview = expiring.items.slice(0, EXPIRY_PREVIEW);
  return (
    <Card className="bg-white border-0 shadow-lg border-orange-100">
      <CardHeader className="bg-orange-50/50 rounded-t-lg">
        <CardTitle className="flex items-center text-2xl text-orange-700">
          <AlertTriangle className="mr-3 h-6 w-6" aria-hidden="true" />
          Expiry Alerts
        </CardTitle>
        <CardDescription className="text-lg">Items expiring soon from your purchases</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <AsyncSection loading={expiring.loading} error={expiring.error} onRetry={expiring.refetch}>
          {preview.length === 0 ? (
            <EmptyState icon={AlertTriangle} title="No expiring products" description="Nothing from your purchases expires soon." />
          ) : (
            <ul className="divide-y divide-orange-50/50">
              {preview.map((item, index) => (
                <ExpiryItemRow key={`${item.purchaseId}-${item.productName}-${index}`} item={item} />
              ))}
            </ul>
          )}
        </AsyncSection>
      </CardContent>
      <CardFooter className="justify-center border-t border-orange-100 pt-6">
        <Button variant="ghost" className="text-orange-700 hover:text-orange-800 text-lg" onClick={onViewAll}>
          View All Alerts
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function DashboardTab({ userName, spending, budget, purchases, expiring, onNavigate }) {
  return (
    <motion.div
      key={TABS.DASHBOARD}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-bold text-gray-900">
          {userName ? `Welcome back, ${userName}!` : 'Welcome back!'}
        </h1>
        <p className="text-lg text-gray-600">Here&apos;s your shopping overview</p>
      </motion.div>

      <SpendingOverview spending={spending} budget={budget} />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <RecentPurchases purchases={purchases} onViewAll={() => onNavigate(TABS.HISTORY)} />
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
        <ExpiryPreview expiring={expiring} onViewAll={() => onNavigate(TABS.ALERTS)} />
      </motion.div>
    </motion.div>
  );
}
