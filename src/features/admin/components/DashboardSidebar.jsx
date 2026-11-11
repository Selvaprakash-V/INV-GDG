'use client';

import { motion } from 'framer-motion';
import { AlertCircle, BarChart2, Brain, Calendar as CalendarIcon, FileBarChart, Package } from 'lucide-react';
import { DASHBOARD_TABS } from '../constants';

const NAV_ITEMS = [
  { name: 'Dashboard', Icon: BarChart2, tab: DASHBOARD_TABS.DASHBOARD },
  { name: 'Inventory', Icon: Package, tab: DASHBOARD_TABS.INVENTORY },
  { name: 'Expiry Alerts', Icon: AlertCircle, tab: DASHBOARD_TABS.ALERTS, showBadge: true },
  { name: 'Reports', Icon: FileBarChart, tab: DASHBOARD_TABS.REPORTS },
  { name: 'Calendar', Icon: CalendarIcon, tab: DASHBOARD_TABS.CALENDAR },
  { name: 'Predictive Analysis', Icon: Brain, tab: DASHBOARD_TABS.AI_ANALYSIS },
];

function CountBadge({ count }) {
  return (
    <span className="bg-red-500 text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
      {count}
      <span className="sr-only"> expiring soon</span>
    </span>
  );
}

export default function DashboardSidebar({ activeTab, onTabChange, alertCount = 0 }) {
  return (
    <>
      {/* Mobile: horizontal tab strip */}
      <nav aria-label="Dashboard sections" className="md:hidden overflow-x-auto px-4 pt-2">
        <div className="flex gap-2 w-max">
          {NAV_ITEMS.map(({ name, Icon, tab, showBadge }) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              aria-current={activeTab === tab ? 'page' : undefined}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                activeTab === tab ? 'bg-purple-100 text-purple-700 font-medium' : 'bg-white/70 text-gray-600'
              }`}
            >
              <Icon className="h-4 w-4 text-purple-600" aria-hidden="true" />
              {name}
              {showBadge && alertCount > 0 && <CountBadge count={alertCount} />}
            </button>
          ))}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="hidden md:block w-64 shrink-0 h-screen sticky top-16 bg-white/80 backdrop-blur-sm border-r border-gray-200 p-4"
      >
        <nav aria-label="Dashboard sections" className="space-y-1 mt-6">
          {NAV_ITEMS.map(({ name, Icon, tab, showBadge }) => (
            <motion.div key={tab} whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
              <button
                type="button"
                onClick={() => onTabChange(tab)}
                aria-current={activeTab === tab ? 'page' : undefined}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-purple-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-purple-600" aria-hidden="true" />
                  <span>{name}</span>
                </div>
                {showBadge && alertCount > 0 && <CountBadge count={alertCount} />}
              </button>
            </motion.div>
          ))}
        </nav>
      </motion.aside>
    </>
  );
}
