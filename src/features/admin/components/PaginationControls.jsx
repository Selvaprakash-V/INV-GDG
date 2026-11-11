'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatNumber } from '../format';

export default function PaginationControls({ pagination, onPrev, onNext, disabled = false }) {
  if (!pagination || pagination.total === 0) return null;
  const { page, totalPages, total, limit, hasPrev, hasNext } = pagination;
  const first = (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  return (
    <nav aria-label="Pagination" className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
      <p className="text-sm text-gray-600">
        Showing {formatNumber(first)}–{formatNumber(last)} of {formatNumber(total)} products
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={disabled || !hasPrev}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </Button>
        <span className="text-sm text-gray-600" aria-current="page">
          Page {page} of {Math.max(1, totalPages)}
        </span>
        <Button variant="outline" size="sm" onClick={onNext} disabled={disabled || !hasNext}>
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
