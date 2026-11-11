'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate } from '../format';

/** One receipt: header (number, date, store, total) and its line items. */
export default function PurchaseCard({ purchase, showExpiry = false, className = '' }) {
  const storeName = purchase.store?.shopName ?? 'Closed store';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`border rounded-lg p-5 hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="font-medium text-lg">Invoice #{purchase.receiptNumber ?? purchase.id}</h3>
          <p className="text-gray-500 text-base">
            {formatDate(purchase.purchaseDate)} • {storeName}
            {purchase.paymentMethod && <span className="ml-2 text-sm">({purchase.paymentMethod})</span>}
          </p>
        </div>
        <Badge variant="outline" className="text-lg">
          {formatCurrency(purchase.totalAmount)}
        </Badge>
      </div>

      <Separator className="my-4" />

      <ul className="space-y-3">
        {(purchase.items ?? []).map((item, index) => (
          <li key={`${item.productId ?? item.productName}-${index}`} className="flex justify-between text-base gap-4">
            <div>
              <span className="font-medium">{item.productName}</span>
              <span className="text-gray-500 ml-3">x{item.quantity}</span>
            </div>
            <div className="text-right">
              <div>{formatCurrency(item.price * item.quantity)}</div>
              {showExpiry && item.expiryDate && (
                <div className="text-sm text-gray-500">Expires: {formatDate(item.expiryDate)}</div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
