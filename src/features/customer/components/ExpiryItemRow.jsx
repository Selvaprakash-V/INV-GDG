'use client';

import { motion } from 'framer-motion';
import { CalendarClock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EXPIRY } from '@/shared/constants';
import { formatMoney } from '@/shared/format';
import { daysLeftLabel, formatDate } from '../format';

/** A purchased item that expires soon. Items within EXPIRY.SOON_DAYS get the red badge. */
export default function ExpiryItemRow({ item, detailed = false }) {
  const urgent = item.daysUntilExpiry <= EXPIRY.SOON_DAYS;
  const store = item.storeName ?? 'Closed store';
  const hasValue = typeof item.value === 'number';
  return (
    <motion.li whileHover={{ scale: 1.01 }} className="p-5 flex justify-between items-center gap-4">
      <div>
        <h4 className="font-medium text-lg">{item.productName}</h4>
        <p className="text-gray-600 text-base">
          {detailed ? `Purchased on ${formatDate(item.purchaseDate)} from ${store}` : `Purchased from ${store}`}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Badge
          variant={urgent ? 'destructive' : 'secondary'}
          className="flex items-center gap-2 text-lg"
          title={`Expires ${formatDate(item.expiryDate)}`}
        >
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          {daysLeftLabel(item.daysUntilExpiry)}
        </Badge>
        {detailed && (
          <div className="text-right">
            <div className="text-lg font-medium">x{item.quantity}</div>
            {hasValue && <div className="text-sm text-gray-600">{formatMoney(item.value)}</div>}
          </div>
        )}
      </div>
    </motion.li>
  );
}
