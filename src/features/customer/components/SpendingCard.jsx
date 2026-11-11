'use client';

import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { formatCurrency, percentOf } from '../format';

const PERCENT_DECIMALS = 1;

/** Change vs. the previous period. `changePct` is null when there is no previous spend. */
function ChangeIndicator({ changePct, periodLabel }) {
  if (changePct === null || changePct === undefined) {
    return (
      <div className="flex items-center mt-3 text-lg text-gray-500">
        <Minus className="h-5 w-5 mr-2" aria-hidden="true" />
        <span>— vs last {periodLabel}</span>
      </div>
    );
  }
  // Spending more than last period is flagged red; spending less is green.
  const up = changePct > 0;
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <div className={cn('flex items-center mt-3 text-lg', up ? 'text-red-500' : 'text-green-600')}>
      <Icon className="h-5 w-5 mr-2" aria-hidden="true" />
      <span>
        <span className="sr-only">{up ? 'Up' : 'Down'} </span>
        {Math.abs(changePct).toFixed(PERCENT_DECIMALS)}% from last {periodLabel}
      </span>
    </div>
  );
}

export default function SpendingCard({ icon: Icon, title, description, period, periodLabel, budget, direction = 'left', delay = 0 }) {
  const amount = period?.amount ?? 0;
  const offset = direction === 'left' ? -20 : 20;
  return (
    <motion.div
      initial={{ opacity: 0, x: offset }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="bg-white border-0 shadow-lg h-full">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Icon className="mr-3 h-6 w-6" aria-hidden="true" />
            {title}
          </CardTitle>
          <CardDescription className="text-lg">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{formatCurrency(amount)}</div>
          <ChangeIndicator changePct={period?.changePct} periodLabel={periodLabel} />
          <div className="mt-6">
            <Progress
              value={percentOf(amount, budget)}
              className="h-3"
              aria-label={`${title}: ${Math.round(percentOf(amount, budget))}% of budget used`}
            />
            <div className="flex justify-between mt-2">
              <p className="text-sm text-gray-500">{formatCurrency(0)}</p>
              <p className="text-sm text-gray-500">{formatCurrency(budget)} budget</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
