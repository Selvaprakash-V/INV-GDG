'use client';

import { motion } from 'framer-motion';
import { CalendarClock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EXPIRY } from '@/shared/constants';
import { daysLeftLabel, formatDate } from '../format';

/** A purchased item that expires soon. Items within EXPIRY.SOON_DAYS get the red badge. */
export default function ExpiryItemRow({ item, detailed = false }) {
  const urgent = item.daysUntilExpiry <= EXPIRY.SOON_DAYS;
  const store = item.storeName ?? 'Unknown store';
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
        {detailed && <div className="text-lg font-medium">x{item.quantity}</div>}
      </div>
    </motion.li>
  );
}
