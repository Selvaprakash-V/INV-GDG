'use client';

import { useRouter } from 'next/navigation';
import { AlertTriangle, Lightbulb, Package, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '../../constants';
import { EmptyState } from '../DataState';
import ToneBadge from '../ToneBadge';
import { PRIORITY_CARD_CLASSES, PRIORITY_TONES } from './predictive-utils';

const TYPE_ICONS = {
  stock: <Package className="h-5 w-5 text-purple-600" aria-hidden="true" />,
  promotion: <ShoppingCart className="h-5 w-5 text-blue-600" aria-hidden="true" />,
  expiry: <AlertTriangle className="h-5 w-5 text-orange-500" aria-hidden="true" />,
};

const TYPE_LABELS = { stock: 'Restock', promotion: 'Promotion', expiry: 'Expiry' };

function RecommendationCard({ rec, onOpenProduct }) {
  return (
    <div className={`p-4 rounded-lg border ${PRIORITY_CARD_CLASSES[rec.priority] ?? 'border-gray-200 bg-gray-50'}`}>
      <div className="flex flex-wrap items-center gap-2">
        {TYPE_ICONS[rec.type] ?? <Lightbulb className="h-5 w-5 text-yellow-500" aria-hidden="true" />}
        <ToneBadge tone={PRIORITY_TONES[rec.priority]} className="capitalize">
          {rec.priority} priority
        </ToneBadge>
        <ToneBadge tone="neutral">{TYPE_LABELS[rec.type] ?? rec.type}</ToneBadge>
      </div>
      <p className="mt-3 text-gray-800">{rec.message}</p>
      {rec.productId && onOpenProduct && (
        <div className="mt-3 flex justify-end">
          <Button size="sm" variant="outline" onClick={() => onOpenProduct(rec.productId)}>
            Open product
          </Button>
        </div>
      )}
    </div>
  );
}

/** Rule-based suggestions returned by the predictive endpoint. */
export default function RecommendationList({ recommendations, type, limit, columns = 1 }) {
  const router = useRouter();
  const filtered = (recommendations ?? []).filter((r) => !type || r.type === type);
  const visible = limit ? filtered.slice(0, limit) : filtered;

  if (!visible.length) {
    return (
      <EmptyState
        icon={Lightbulb}
        title="No recommendations right now"
        description="Nothing needs attention based on recent sales and stock levels."
      />
    );
  }

  return (
    <div className={`grid gap-4 ${columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
      {visible.map((rec, i) => (
        <RecommendationCard
          key={`${rec.type}-${rec.productId ?? i}`}
          rec={rec}
          onOpenProduct={(id) => router.push(ROUTES.editProduct(id))}
        />
      ))}
    </div>
  );
}
