'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import LogoutButton from '@/components/LogoutButton';
import { NAV_ITEMS } from '../tabs';

function initialOf(name, email) {
  return (name || email || '?').trim().charAt(0).toUpperCase();
}

export default function CustomerSidebar({ user, activeTab, onSelect }) {
  const name = user?.name || '';
  const email = user?.email || '';
  return (
    <motion.aside
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="w-72 bg-white/90 backdrop-blur-sm shadow-lg flex flex-col border-r border-purple-100"
    >
      <div className="p-6 flex items-center space-x-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="text-lg bg-purple-100 text-purple-700">{initialOf(name, email)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-medium text-lg truncate">{name || 'Customer'}</p>
          {email && <p className="text-sm text-gray-500 truncate">{email}</p>}
        </div>
      </div>

      <Separator />

      <nav aria-label="Customer dashboard" className="flex-1 p-4 space-y-2">
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
          const active = activeTab === id;
          return (
            <motion.div key={id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant={active ? 'secondary' : 'ghost'}
                aria-current={active ? 'page' : undefined}
                className={`w-full justify-start text-lg ${active ? 'bg-purple-50 text-purple-700' : ''}`}
                onClick={() => onSelect(id)}
              >
                <Icon className="mr-3 h-5 w-5" aria-hidden="true" />
                {label}
                {active && <ChevronRight className="ml-auto h-5 w-5" aria-hidden="true" />}
              </Button>
            </motion.div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-purple-100">
        <LogoutButton className="w-full" />
      </div>
    </motion.aside>
  );
}
