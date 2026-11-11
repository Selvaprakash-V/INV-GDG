'use client';

import { useState } from 'react';
import { AlertCircle, Edit, Package, Trash2 } from 'lucide-react';
import { daysUntil } from '@/shared/expiry';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { URGENT_EXPIRY_DAYS } from '../../constants';
import { formatDate, pluralize } from '../../format';
import { DataBlock, EmptyState } from '../DataState';
import ToneBadge from '../ToneBadge';
import PaginationControls from '../PaginationControls';
import { useExpiryPage } from '../../hooks/useExpiryPage';

const VARIANTS = {
  expiring: {
    header: 'bg-orange-50 border-orange-100',
    title: 'text-orange-800',
    icon: 'text-orange-600',
    hover: 'hover:bg-orange-50/30',
  },
  expired: {
    header: 'bg-red-50 border-red-100',
    title: 'text-red-800',
    icon: 'text-red-600',
    hover: 'hover:bg-red-50/30',
  },
};

function ExpiryRow({ item, variant, hover, onEdit, onDelete }) {
  const expired = variant === 'expired';
  // Summary rows carry daysUntilExpiry; rows from the products API do not.
  const days = item.daysUntilExpiry ?? daysUntil(item.expiryDate);
  const urgent = expired || days <= URGENT_EXPIRY_DAYS;
  return (
    <li className={`p-4 transition-colors ${hover}`}>
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${urgent ? 'bg-red-100' : 'bg-orange-100'}`}>
            <AlertCircle className={`h-5 w-5 ${urgent ? 'text-red-500' : 'text-orange-500'}`} aria-hidden="true" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{item.name}</h4>
            <p className="text-sm text-gray-500">{item.category} • Stock: {item.stock}</p>
          </div>
        </div>
        <div className="text-right">
          <ToneBadge tone={urgent ? 'danger' : 'warning'} className="mb-1">
            {expired ? 'Expired' : `${pluralize(days, 'day')} left`}
          </ToneBadge>
          <p className="text-sm text-gray-500">
            {expired ? 'Expired on' : 'Expires on'} {formatDate(item.expiryDate)}
          </p>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
          <Edit className="mr-1 h-3 w-3" aria-hidden="true" />
          Edit
        </Button>
        {onDelete && (
          <Button variant="destructive" size="sm" onClick={() => onDelete(item)}>
            <Trash2 className="mr-1 h-3 w-3" aria-hidden="true" />
            Remove
          </Button>
        )}
      </div>
    </li>
  );
}

/**
 * List of expiring or expired products. Starts with the most urgent items from the
 * inventory summary; "View all" switches to the complete, paginated list.
 */
export default function ExpiryListCard({
  variant,
  title,
  description,
  items: summaryItems,
  total,
  thresholdDays,
  refreshToken,
  emptyTitle,
  emptyDescription,
  state: summaryState,
  onEdit,
  onDelete,
}) {
  const v = VARIANTS[variant];
  const [showAll, setShowAll] = useState(false);
  const full = useExpiryPage({ variant, thresholdDays, enabled: showAll, refreshToken });
  const items = showAll ? full.items : summaryItems;
  const state = showAll ? { loading: full.loading, error: full.error, onRetry: full.refetch } : summaryState;
  const shown = items?.length ?? 0;
  return (
    <Card className="border border-gray-200 gap-0 py-0 overflow-hidden">
      <CardHeader className={`border-b py-4 ${v.header}`}>
        <CardTitle className={`flex items-center ${v.title}`}>
          <AlertCircle className={`mr-2 h-5 w-5 ${v.icon}`} aria-hidden="true" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <DataBlock
          {...state}
          data={items}
          isEmpty={shown === 0}
          empty={<EmptyState icon={Package} title={emptyTitle} description={emptyDescription} />}
        >
          <ul className="divide-y divide-gray-100">
            {items?.map((item) => (
              <ExpiryRow key={item.id} item={item} variant={variant} hover={v.hover} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </ul>
          {showAll ? (
            <PaginationControls pagination={full.pagination} onPrev={full.prevPage} onNext={full.nextPage} disabled={full.loading} />
          ) : (
            total > shown && (
              <div className="px-4 py-3 text-sm text-gray-600 border-t border-gray-100 flex items-center justify-between gap-2">
                <span>
                  Showing the {shown} most urgent of {total} products.
                </span>
                <Button variant="outline" size="sm" onClick={() => setShowAll(true)}>
                  View all {total}
                </Button>
              </div>
            )
          )}
        </DataBlock>
      </CardContent>
    </Card>
  );
}
