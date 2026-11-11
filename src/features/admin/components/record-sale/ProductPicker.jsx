'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { isExpired } from '@/shared/expiry';
import { formatCurrency } from '../../format';
import { useProductSearch } from '../../hooks/useProductSearch';
import { ErrorState, LoadingState } from '../DataState';
import ToneBadge from '../ToneBadge';

function ResultRow({ product, inCart, onAdd }) {
  const expired = isExpired(product.expiryDate);
  const outOfStock = product.stock < 1;
  const atMax = inCart >= product.stock;
  const disabled = expired || outOfStock || atMax;
  const reason = expired ? 'Expired' : outOfStock ? 'Out of stock' : atMax ? 'All stock in cart' : null;

  return (
    <li className="flex items-center justify-between gap-3 px-3 py-2">
      <div className="min-w-0">
        <p className="font-medium truncate">{product.name}</p>
        <p className="text-sm text-gray-500">
          {formatCurrency(product.price)} • {product.stock} in stock
          {inCart > 0 && ` • ${inCart} in sale`}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {reason && <ToneBadge tone={expired || outOfStock ? 'danger' : 'neutral'}>{reason}</ToneBadge>}
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => onAdd(product)}
          aria-label={`Add ${product.name} to sale`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </li>
  );
}

/** Debounced product search; `cartQuantities` maps productId → quantity already in the sale. */
export default function ProductPicker({ onAdd, cartQuantities }) {
  const [query, setQuery] = useState('');
  const search = useProductSearch(query);

  let body = null;
  if (search.error) body = <ErrorState error={search.error} title="Search failed" onRetry={search.refetch} className="py-6" />;
  else if (search.loading && !search.results) body = <LoadingState label="Searching…" className="py-6" />;
  else if (search.results && search.results.length === 0 && !search.pending)
    body = <p className="px-3 py-6 text-center text-sm text-gray-500">No products match “{search.term}”.</p>;
  else if (search.results)
    body = (
      <ul className="divide-y divide-gray-100" aria-busy={search.loading}>
        {search.results.map((p) => (
          <ResultRow key={p.id} product={p} inCart={cartQuantities.get(p.id) ?? 0} onAdd={onAdd} />
        ))}
      </ul>
    );

  return (
    <div className="space-y-2">
      <Label htmlFor="product-search">Add products</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
        <Input
          id="product-search"
          type="search"
          placeholder="Search by product name or barcode…"
          className="pl-10 bg-white"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
      </div>
      {body ? (
        <div className="rounded-md border border-gray-200 bg-white max-h-72 overflow-y-auto">{body}</div>
      ) : (
        <p className="text-sm text-gray-500">Start typing to find products.</p>
      )}
    </div>
  );
}
