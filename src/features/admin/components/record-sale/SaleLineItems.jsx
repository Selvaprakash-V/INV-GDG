'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '../../format';
import { EmptyState } from '../DataState';

/** Keeps the raw text while typing; commits a clamped number on blur / Enter. */
function QuantityInput({ line, max, onCommit }) {
  const [text, setText] = useState(String(line.quantity));
  useEffect(() => setText(String(line.quantity)), [line.quantity]);
  const commit = () => {
    const n = Number(text);
    onCommit(Number.isFinite(n) ? n : line.quantity);
    setText(String(line.quantity));
  };
  return (
    <Input
      type="number"
      inputMode="numeric"
      min={1}
      max={max}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          commit();
        }
      }}
      className="w-20 ml-auto text-right"
      aria-label={`Quantity of ${line.product.name} (max ${max})`}
    />
  );
}

export default function SaleLineItems({ lines, maxQuantityFor, onQuantityChange, onRemove, estimatedTotal, error }) {
  if (lines.length === 0) {
    return (
      <div>
        <EmptyState tone="neutral" icon={ShoppingCart} title="No items yet" description="Search for products above to add them to this sale." className="py-8" />
        {error && <p className="text-sm text-red-600 text-center" role="alert">{error}</p>}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">Unit price</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Line total</TableHead>
            <TableHead className="w-10"><span className="sr-only">Remove</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((line) => {
            const max = maxQuantityFor(line.product);
            return (
              <TableRow key={line.product.id}>
                <TableCell>
                  <p className="font-medium">{line.product.name}</p>
                  <p className="text-xs text-gray-500">{line.product.stock} in stock</p>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(line.product.price)}</TableCell>
                <TableCell className="text-right">
                  <QuantityInput line={line} max={max} onCommit={(n) => onQuantityChange(line.product.id, n)} />
                </TableCell>
                <TableCell className="text-right">{formatCurrency(line.product.price * line.quantity)}</TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                    onClick={() => onRemove(line.product.id)}
                    aria-label={`Remove ${line.product.name}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3} className="text-right">
              Estimated total
              <span className="block text-xs font-normal text-gray-500">Final amount is calculated when the sale is recorded</span>
            </TableCell>
            <TableCell className="text-right text-lg">{formatCurrency(estimatedTotal)}</TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
