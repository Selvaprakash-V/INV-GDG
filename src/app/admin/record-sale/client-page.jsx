'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PAYMENT_METHODS } from '@/shared/constants';
import { ROUTES } from '@/features/admin/constants';
import { useRecordSale } from '@/features/admin/hooks/useRecordSale';
import ProductPicker from '@/features/admin/components/record-sale/ProductPicker';
import SaleLineItems from '@/features/admin/components/record-sale/SaleLineItems';
import SaleReceipt from '@/features/admin/components/record-sale/SaleReceipt';

export default function RecordSale() {
  const sale = useRecordSale();
  const cartQuantities = useMemo(() => new Map(sale.lines.map((l) => [l.product.id, l.quantity])), [sale.lines]);
  const emailError = sale.fieldErrors.customerEmail;
  const itemsError = sale.fieldErrors.items;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 text-gray-800">
      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
        <Link
          href={ROUTES.DASHBOARD}
          className="inline-flex items-center text-sm font-medium text-purple-700 hover:text-purple-900"
        >
          <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" />
          Back to dashboard
        </Link>

        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <ShoppingCart className="mr-3 h-7 w-7 text-purple-600" aria-hidden="true" />
            Record sale
          </h1>
          <p className="text-gray-600 mt-1">Log a purchase for a registered customer. Stock is updated automatically.</p>
        </div>

        {sale.receipt ? (
          <SaleReceipt purchase={sale.receipt} onRecordAnother={sale.reset} />
        ) : (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              sale.submit();
            }}
          >
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Sale details</CardTitle>
                <CardDescription>Prices are estimates; the final total is calculated by the server.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-email">Customer email</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      autoComplete="off"
                      placeholder="customer@example.com"
                      value={sale.customerEmail}
                      onChange={(e) => sale.setCustomerEmail(e.target.value)}
                      aria-invalid={Boolean(emailError)}
                      aria-describedby={emailError ? 'customer-email-error' : undefined}
                      className="bg-white"
                    />
                    {emailError && (
                      <p id="customer-email-error" className="text-sm text-red-600">{emailError}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment-method">Payment method</Label>
                    <Select value={sale.paymentMethod} onValueChange={sale.setPaymentMethod}>
                      <SelectTrigger id="payment-method" className="w-full bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <ProductPicker onAdd={sale.addProduct} cartQuantities={cartQuantities} />

                <SaleLineItems
                  lines={sale.lines}
                  maxQuantityFor={sale.maxQuantityFor}
                  onQuantityChange={sale.setQuantity}
                  onRemove={sale.removeLine}
                  estimatedTotal={sale.estimatedTotal}
                  error={itemsError}
                />

                {sale.error && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                    {sale.error}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button type="button" variant="outline" asChild>
                  <Link href={ROUTES.DASHBOARD}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={sale.submitting} className="bg-purple-600 hover:bg-purple-700">
                  {sale.submitting ? 'Recording…' : 'Record sale'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
}
