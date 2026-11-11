'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { DASHBOARD_TABS } from '@/features/admin/constants';
import { useDashboardTab } from '@/features/admin/hooks/useDashboardTab';
import { useInventorySummary } from '@/features/admin/hooks/useAnalytics';
import { LoadingState } from '@/features/admin/components/DataState';
import DashboardHeader from '@/features/admin/components/DashboardHeader';
import DashboardSidebar from '@/features/admin/components/DashboardSidebar';
import OverviewTab from '@/features/admin/components/overview/OverviewTab';
import InventoryTab from '@/features/admin/components/inventory/InventoryTab';
import AlertsTab from '@/features/admin/components/alerts/AlertsTab';
import ReportsTab from '@/features/admin/components/reports/ReportsTab';
import CalendarTab from '@/features/admin/components/calendar/CalendarTab';

const PredictiveAnalysis = dynamic(() => import('@/components/admin/PredictiveAnalysis'), {
  ssr: false,
  loading: () => <LoadingState label="Loading analysis…" />,
});

function TabContent({ tab, summary, onTabChange }) {
  switch (tab) {
    case DASHBOARD_TABS.INVENTORY:
      return <InventoryTab onInventoryChanged={summary.refetch} />;
    case DASHBOARD_TABS.ALERTS:
      return <AlertsTab summary={summary} />;
    case DASHBOARD_TABS.REPORTS:
      return <ReportsTab />;
    case DASHBOARD_TABS.CALENDAR:
      return <CalendarTab />;
    case DASHBOARD_TABS.AI_ANALYSIS:
      return <PredictiveAnalysis />;
    default:
      return <OverviewTab summary={summary} onTabChange={onTabChange} />;
  }
}

function Dashboard() {
  const [activeTab, setTab] = useDashboardTab();
  const summary = useInventorySummary();
  const expiringCount = summary.data?.stats?.expiringSoon ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 text-gray-800 font-sans">
      <DashboardHeader
        expiringCount={expiringCount}
        onShowAlerts={() => setTab(DASHBOARD_TABS.ALERTS)}
        onSettingsSaved={summary.refetch}
      />
      <div className="pt-24 sm:pt-16 md:flex">
        <DashboardSidebar activeTab={activeTab} onTabChange={setTab} alertCount={expiringCount} />
        <main className="flex-1 min-w-0 p-4 md:p-6">
          <TabContent tab={activeTab} summary={summary} onTabChange={setTab} />
        </main>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  // useSearchParams (inside useDashboardTab) requires a Suspense boundary in Next 15.
  return (
    <Suspense fallback={<LoadingState label="Loading dashboard…" className="min-h-screen" />}>
      <Dashboard />
    </Suspense>
  );
}
