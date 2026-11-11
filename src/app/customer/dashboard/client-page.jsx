'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import CustomerSidebar from '@/features/customer/components/CustomerSidebar';
import DashboardTab from '@/features/customer/components/DashboardTab';
import HistoryTab from '@/features/customer/components/HistoryTab';
import AlertsTab from '@/features/customer/components/AlertsTab';
import StoresTab from '@/features/customer/components/StoresTab';
import BudgetTab from '@/features/customer/components/BudgetTab';
import { useSpending } from '@/features/customer/hooks/useSpending';
import { usePurchases } from '@/features/customer/hooks/usePurchases';
import { useExpiringItems } from '@/features/customer/hooks/useExpiringItems';
import { useCustomerSettings } from '@/features/customer/hooks/useCustomerSettings';
import { TABS } from '@/features/customer/tabs';

/**
 * Customer dashboard. Data hooks live here (not in the tabs) so switching tabs
 * keeps already-loaded data and pagination state.
 */
export default function ClientCustomerDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
  const [storeFilter, setStoreFilter] = useState(null);

  const spending = useSpending();
  const purchases = usePurchases();
  // Separate, server-filtered list for "View purchases" from the Stores tab.
  const storePurchases = usePurchases({ storeId: storeFilter?.id, enabled: Boolean(storeFilter) });
  const expiring = useExpiringItems();
  const settings = useCustomerSettings();

  const selectTab = (tab) => {
    if (tab !== TABS.HISTORY) setStoreFilter(null);
    setActiveTab(tab);
  };

  const viewStorePurchases = (store) => {
    setStoreFilter(store);
    setActiveTab(TABS.HISTORY);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <CustomerSidebar user={session?.user} activeTab={activeTab} onSelect={selectTab} />

      <main className="flex-1 overflow-y-auto p-8">
        <AnimatePresence mode="wait">
          {activeTab === TABS.DASHBOARD && (
            <DashboardTab
              key={TABS.DASHBOARD}
              userName={session?.user?.name}
              spending={spending}
              budget={settings.budget}
              purchases={purchases}
              expiring={expiring}
              onNavigate={selectTab}
            />
          )}
          {activeTab === TABS.HISTORY && (
            <HistoryTab
              key={TABS.HISTORY}
              purchases={storeFilter ? storePurchases : purchases}
              storeFilter={storeFilter}
              onClearStoreFilter={() => setStoreFilter(null)}
            />
          )}
          {activeTab === TABS.ALERTS && <AlertsTab key={TABS.ALERTS} expiring={expiring} />}
          {activeTab === TABS.STORES && (
            <StoresTab key={TABS.STORES} spending={spending} onViewStorePurchases={viewStorePurchases} />
          )}
          {activeTab === TABS.BUDGET && <BudgetTab key={TABS.BUDGET} settings={settings} spending={spending} />}
        </AnimatePresence>
      </main>
    </div>
  );
}
