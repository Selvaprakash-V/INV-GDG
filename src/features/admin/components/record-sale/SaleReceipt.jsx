'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ROUTES } from '../../constants';
import { formatCurrency, formatDate } from '../../format';

export default function SaleReceipt({ purchase, onRecordAnother }) {
  return (
    <Card className="shadow-md">
      <CardHeader className="border-b border-green-100 bg-green-50">
        <CardTitle className="flex items-center text-green-800">
          <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" aria-hidden="true" />
          Sale recorded
        </CardTitle>
        <CardDescription>
          Receipt <strong className="text-gray-900">{purchase.receiptNumber}</strong> ·{' '}
          {formatDate(purchase.purchaseDate, 'yyyy-MM-dd HH:mm')} · {purchase.paymentMethod}
          {purchase.customer && (
            <>
              {' '}· {purchase.customer.fullName} ({purchase.customer.email})
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchase.items.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="text-right">Total</TableCell>
                <TableCell className="text-right text-lg">{formatCurrency(purchase.totalAmount)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 justify-end">
        <Button variant="outline" asChild>
          <Link href={ROUTES.DASHBOARD}>Back to dashboard</Link>
        </Button>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={onRecordAnother} autoFocus>
          Record another
        </Button>
      </CardFooter>
    </Card>
  );
}
