import { AlertTriangle, History, Home, Store, Wallet } from 'lucide-react';

export const TABS = Object.freeze({
  DASHBOARD: 'dashboard',
  HISTORY: 'history',
  ALERTS: 'alerts',
  STORES: 'stores',
  BUDGET: 'budget',
});

export const NAV_ITEMS = Object.freeze([
  { id: TABS.DASHBOARD, icon: Home, label: 'Dashboard' },
  { id: TABS.HISTORY, icon: History, label: 'Purchase History' },
  { id: TABS.ALERTS, icon: AlertTriangle, label: 'Expiry Alerts' },
  { id: TABS.STORES, icon: Store, label: 'My Stores' },
  { id: TABS.BUDGET, icon: Wallet, label: 'Set Budget' },
]);
