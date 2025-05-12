'use client';

import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, ShoppingCart, AlertCircle } from 'lucide-react';

const EnhancedCalendar = ({ products, purchases }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  // Process data to create calendar days
  useEffect(() => {
    if (!products || !purchases) return;

    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });

    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = start.getDay();

    // Add empty cells for days before the first day of the month
    const daysWithPadding = Array(firstDayOfMonth).fill(null).concat(days);

    // Process each day to add product and purchase data
    const processedDays = daysWithPadding.map(day => {
      if (!day) return null;

      // Find products expiring on this day
      const expiringProducts = products.filter(product => {
        const expiryDate = new Date(product.expiryDate);
        return isSameDay(expiryDate, day);
      });

      // Find purchases made on this day
      const dayPurchases = purchases.filter(purchase => {
        const purchaseDate = new Date(purchase.purchaseDate);
        return isSameDay(purchaseDate, day);
      });

      return {
        date: day,
        expiringProducts,
        purchases: dayPurchases,
        isToday: isSameDay(day, new Date()),
        isCurrentMonth: isSameMonth(day, currentDate)
      };
    });

    setCalendarDays(processedDays);
  }, [currentDate, products, purchases]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  // Format date for display
  const formatDate = (date) => {
    return format(date, 'yyyy-MM-dd');
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-blue-800 flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5 text-blue-600" />
            Inventory Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousMonth}
              className="text-blue-600 hover:bg-blue-50"
            >
              Previous
            </Button>
            <span className="text-lg font-medium">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonth}
              className="text-blue-600 hover:bg-blue-50"
            >
              Next
            </Button>
          </div>
        </div>
        <CardDescription>
          View product purchases and expiry dates at a glance
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {/* Calendar header - days of week */}
        <div className="grid grid-cols-7 gap-px mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-md overflow-hidden">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`relative bg-white min-h-28 p-2 transition-all ${
                day?.isToday ? 'ring-2 ring-blue-500' : ''
              } ${
                day?.isCurrentMonth ? 'opacity-100' : 'opacity-50'
              } hover:bg-blue-50`}
            >
              {day ? (
                <>
                  <div className={`text-right font-medium ${day.isToday ? 'text-blue-600' : ''}`}>
                    {format(day.date, 'd')}
                  </div>

                  {/* Indicators for expiring products and purchases */}
                  <div className="flex flex-col gap-1 mt-1">
                    {day.expiringProducts.length > 0 && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 text-red-500" />
                        <span className="text-xs text-red-600">
                          {day.expiringProducts.length} expiring
                        </span>
                      </div>
                    )}
                    {day.purchases.length > 0 && (
                      <div className="flex items-center gap-1">
                        <ShoppingCart className="h-3 w-3 text-blue-500" />
                        <span className="text-xs text-blue-600">
                          {day.purchases.length} purchased
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product details on hover */}
                  {day.expiringProducts.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs font-medium text-red-600">Expiring:</div>
                      <ul className="text-xs text-gray-600 mt-1">
                        {day.expiringProducts.slice(0, 2).map((product, idx) => (
                          <li key={idx} className="truncate">
                            {product.name} ({product.stock})
                          </li>
                        ))}
                        {day.expiringProducts.length > 2 && (
                          <li className="text-xs text-gray-500">
                            +{day.expiringProducts.length - 2} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedCalendar;
