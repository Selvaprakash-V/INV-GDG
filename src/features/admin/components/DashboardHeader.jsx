'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Bell, Package, Settings, ShoppingCart, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LogoutButton from '@/components/LogoutButton';
import { HEADER_SCROLL_OFFSET, ROUTES } from '../constants';
import NotificationSettingsDialog from './NotificationSettingsDialog';

function useScrolled(offset) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);
  return scrolled;
}

export default function DashboardHeader({ expiringCount = 0, onShowAlerts, onSettingsSaved }) {
  const isScrolled = useScrolled(HEADER_SCROLL_OFFSET);
  const { data: session } = useSession();
  const shopName = session?.user?.shopName;
  const alertLabel = expiringCount > 0 ? `Expiry alerts (${expiringCount} expiring soon)` : 'Expiry alerts';

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 shadow-md backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center gap-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-baseline gap-3 min-w-0"
        >
          <Link href="/" aria-label="TrackIt home">
            <span className="text-3xl font-extrabold tracking-wide hover:scale-105 transition-transform duration-300 inline-block">
              <span className="text-purple-600">TRAC</span>
              <span className="text-pink-600">KIT</span>
            </span>
          </Link>
          {shopName && (
            <span className="hidden sm:inline truncate text-sm font-medium text-gray-600" title={shopName}>
              {shopName}
            </span>
          )}
        </motion.div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
            <Link href={ROUTES.RECORD_SALE} aria-label="Record sale">
              <ShoppingCart className="h-4 w-4 sm:mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">Record sale</span>
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="border-purple-200">
            <Link href={ROUTES.ADD_PRODUCT} aria-label="Add product">
              <Package className="h-4 w-4 sm:mr-2" aria-hidden="true" />
              <span className="hidden sm:inline">Add product</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-purple-600 relative"
            onClick={onShowAlerts}
            aria-label={alertLabel}
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            {expiringCount > 0 && (
              <span
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center"
                aria-hidden="true"
              >
                {expiringCount}
              </span>
            )}
          </Button>
          <NotificationSettingsDialog
            onSaved={onSettingsSaved}
            trigger={
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-purple-600" aria-label="Notification settings">
                <Settings className="h-5 w-5" aria-hidden="true" />
              </Button>
            }
          />
          <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-purple-600">
            <Link href="/account" aria-label="Your account">
              <UserCircle className="h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
          <LogoutButton className="hidden sm:inline-flex" />
        </div>
      </div>
      <div className="sm:hidden px-4 pb-2 flex justify-between items-center">
        {shopName && <span className="truncate text-sm font-medium text-gray-600">{shopName}</span>}
        <LogoutButton />
      </div>
    </header>
  );
}
