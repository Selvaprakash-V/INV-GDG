'use client';

import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ShoppingCart, AlertCircle } from 'lucide-react';
import { ErrorState } from '@/features/admin/components/DataState';
import { useCalendarMonth } from '@/features/admin/hooks/useCalendarMonth';
import { pluralize } from '@/features/admin/format';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const NAMES_PER_DAY = 2;

/** Group items into a map keyed by yyyy-MM-dd of the given date field. */
function groupByDay(items, field) {
  const map = new Map();
  for (const item of items ?? []) {
    const key = format(new Date(item[field]), 'yyyy-MM-dd');
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return map;
}

function buildDays(month, products, purchases) {
  const start = startOfMonth(month);
  const days = eachDayOfInterval({ start, end: endOfMonth(month) });
  const expiring = groupByDay(products, 'expiryDate');
  const sales = groupByDay(purchases, 'purchaseDate');
  const today = new Date();
  const padding = Array(start.getDay()).fill(null);
  return padding.concat(
    days.map((date) => {
      const key = format(date, 'yyyy-MM-dd');
      return {
        key,
        date,
        expiringProducts: expiring.get(key) ?? [],
        purchases: sales.get(key) ?? [],
        isToday: isSameDay(date, today),
      };
    })
  );
}

function DayCell({ day }) {
  return (
    <div className={`relative bg-white min-h-28 p-2 transition-all hover:bg-blue-50 ${day.isToday ? 'ring-2 ring-blue-500' : ''}`}>
      <div className={`text-right font-medium ${day.isToday ? 'text-blue-600' : ''}`}>{format(day.date, 'd')}</div>
      <div className="flex flex-col gap-1 mt-1">
        {day.expiringProducts.length > 0 && (
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3 text-red-500" aria-hidden="true" />
            <span className="text-xs text-red-600">{day.expiringProducts.length} expiring</span>
          </div>
        )}
        {day.purchases.length > 0 && (
          <div className="flex items-center gap-1">
            <ShoppingCart className="h-3 w-3 text-blue-500" aria-hidden="true" />
            <span className="text-xs text-blue-600">{pluralize(day.purchases.length, 'sale')}</span>
          </div>
        )}
      </div>
      {day.expiringProducts.length > 0 && (
        <div className="mt-2">
          <div className="text-xs font-medium text-red-600">Expiring:</div>
          <ul className="text-xs text-gray-600 mt-1">
            {day.expiringProducts.slice(0, NAMES_PER_DAY).map((product) => (
              <li key={product.id} className="truncate" title={product.name}>
                {product.name} ({product.stock})
              </li>
            ))}
            {day.expiringProducts.length > NAMES_PER_DAY && (
              <li className="text-xs text-gray-500">+{day.expiringProducts.length - NAMES_PER_DAY} more</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Month view of product expiries and recorded sales, fetched per visible month. */
export default function EnhancedCalendar() {
  const cal = useCalendarMonth();
  const days = useMemo(() => buildDays(cal.month, cal.products, cal.purchases), [cal.month, cal.products, cal.purchases]);
  const hasData = cal.products !== null && cal.purchases !== null;

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-xl font-bold text-blue-800 flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5 text-blue-600" aria-hidden="true" />
            Inventory Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={cal.goToPreviousMonth} className="text-blue-600 hover:bg-blue-50">
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </Button>
            <span className="text-lg font-medium min-w-36 text-center" aria-live="polite">
              {format(cal.month, 'MMMM yyyy')}
            </span>
            <Button variant="outline" size="sm" onClick={cal.goToNextMonth} className="text-blue-600 hover:bg-blue-50">
              Next
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
        <CardDescription>View recorded sales and product expiry dates at a glance</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {cal.error && !hasData ? (
          <ErrorState error={cal.error} title="Could not load calendar data" onRetry={cal.refetch} />
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[640px]" aria-busy={cal.loading}>
              <div className="grid grid-cols-7 gap-px mb-2">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="text-center font-medium text-gray-600 py-2">{day}</div>
                ))}
              </div>
              <div className={`grid grid-cols-7 gap-px bg-gray-200 rounded-md overflow-hidden transition-opacity ${cal.loading ? 'opacity-50' : ''}`}>
                {days.map((day, index) =>
                  day ? <DayCell key={day.key} day={day} /> : <div key={`pad-${index}`} className="bg-white min-h-28" />
                )}
              </div>
            </div>
          </div>
        )}
        {cal.loading && <p className="mt-3 text-sm text-gray-500" role="status">Loading {format(cal.month, 'MMMM')}…</p>}
        {cal.truncated && (
          <p className="mt-3 text-sm text-amber-700">
            This month has more than 1,000 products or sales; only the first 1,000 of each are shown. Use the Inventory tab filters to see the rest.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
