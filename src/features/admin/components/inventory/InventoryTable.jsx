'use client';

import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EXPIRY_STATUS } from '@/shared/constants';
import { expiryStatus } from '@/shared/expiry';
import { STOCK_BAR_FULL } from '../../constants';
import { formatCurrency, formatDate } from '../../format';
import ToneBadge from '../ToneBadge';

const STATUS_DISPLAY = {
  [EXPIRY_STATUS.FRESH]: { label: 'Fresh', tone: 'primary' },
  [EXPIRY_STATUS.EXPIRING]: { label: 'Expiring', tone: 'warning' },
  [EXPIRY_STATUS.EXPIRED]: { label: 'Expired', tone: 'danger' },
  [EXPIRY_STATUS.OUT_OF_STOCK]: { label: 'Out of stock', tone: 'danger' },
};

const HEAD_CLASS = 'text-purple-800';

export default function InventoryTable({ products, onEdit, onDelete }) {
  const now = new Date();
  return (
    <Table>
      <TableHeader className="bg-purple-50">
        <TableRow>
          <TableHead className={HEAD_CLASS}>Product</TableHead>
          <TableHead className={HEAD_CLASS}>Category</TableHead>
          <TableHead className={HEAD_CLASS}>Price</TableHead>
          <TableHead className={HEAD_CLASS}>Stock</TableHead>
          <TableHead className={HEAD_CLASS}>Expiry Date</TableHead>
          <TableHead className={HEAD_CLASS}>Status</TableHead>
          <TableHead className={`text-right ${HEAD_CLASS}`}>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((item) => {
          const status = STATUS_DISPLAY[expiryStatus(item, now)];
          return (
            <TableRow key={item.id} className="hover:bg-purple-50/50 transition-colors">
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{formatCurrency(item.price)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress
                    value={Math.min(100, (item.stock / STOCK_BAR_FULL) * 100)}
                    className="h-2 w-24"
                    aria-hidden="true"
                  />
                  <span>{item.stock}</span>
                </div>
              </TableCell>
              <TableCell>{formatDate(item.expiryDate)}</TableCell>
              <TableCell>
                <ToneBadge tone={status.tone}>{status.label}</ToneBadge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label={`Actions for ${item.name}`}>
                      <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => onDelete(item)}>
                      <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
