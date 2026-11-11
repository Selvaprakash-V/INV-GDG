'use client';

import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/** Labelled input with a leading icon, optional hint and an accessible error message. */
export default function AuthField({ id, label, icon: Icon, error, hint, className, ...inputProps }) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} className="text-gray-800">
        {label}
      </Label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
        )}
        <Input
          id={id}
          name={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(Icon && 'pl-10', error && 'border-red-500')}
          {...inputProps}
        />
      </div>
      {hint && !error && (
        <p id={hintId} className="text-xs text-gray-500">
          {hint}
        </p>
      )}
      {error && (
        <motion.p id={errorId} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-500">
          {error}
        </motion.p>
      )}
    </div>
  );
}
