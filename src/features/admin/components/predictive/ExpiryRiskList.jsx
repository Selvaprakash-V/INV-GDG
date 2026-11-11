'use client';

import { ShieldCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { pluralize } from '../../format';
import { EmptyState } from '../DataState';
import ToneBadge from '../ToneBadge';
import { riskTone } from './predictive-utils';

/**
 * expiryRisk rows: units projected to remain unsold at expiry given current demand.
 * `compact` renders the short overview variant.
 */
export default function ExpiryRiskList({ rows, limit, compact = false }) {
  const visible = limit ? rows?.slice(0, limit) : rows;
  if (!visible?.length) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="No expiry risk detected"
        description="At current demand, stock is expected to sell before it expires."
      />
    );
  }

  return (
    <ul className={compact ? 'space-y-4' : 'space-y-3'}>
      {visible.map((r) => (
        <li
          key={r.productId}
          className={compact ? 'flex items-center justify-between gap-3' : 'p-4 rounded-lg border border-gray-200 hover:border-orange-200 transition-colors'}
        >
          <div className={compact ? '' : 'flex flex-col md:flex-row md:items-center md:justify-between gap-3'}>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{r.productName}</p>
                {!compact && <ToneBadge tone={riskTone(r.riskScore)}>{r.riskScore}% risk</ToneBadge>}
              </div>
              <p className="text-sm text-gray-500">
                {r.category} • {r.stock} in stock • expires in {pluralize(r.daysUntilExpiry, 'day')}
              </p>
            </div>
            {!compact && (
              <div className="flex flex-col gap-1 md:items-end">
                <Progress value={r.riskScore} className="h-2 w-32" aria-label={`Risk score ${r.riskScore} of 100`} />
                <p className="text-sm text-gray-600">
                  ~{pluralize(r.unitsAtRisk, 'unit')} may expire unsold
                  {r.predictedDailyDemand > 0 ? ` (selling ${r.predictedDailyDemand}/day)` : ' (no recent sales)'}
                </p>
              </div>
            )}
          </div>
          {compact && (
            <div className="flex flex-col items-end">
              <ToneBadge tone={riskTone(r.riskScore)}>{r.riskScore}% risk</ToneBadge>
              <span className="text-xs text-gray-500 mt-1">~{r.unitsAtRisk} at risk</span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
