'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Loading / error / empty placeholders shared by every dashboard section. */
export function LoadingState({ label = 'Loading…', className = 'py-10' }) {
  return (
    <div role="status" aria-live="polite" className={`flex items-center justify-center gap-3 text-gray-500 ${className}`}>
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      <span className="text-base">{label}</span>
    </div>
  );
}

export function ErrorState({ error, onRetry, message = 'Could not load this section.', className = 'py-8' }) {
  return (
    <div role="alert" className={`flex flex-col items-center gap-3 text-center ${className}`}>
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="h-5 w-5" aria-hidden="true" />
        <span className="text-base">{message}</span>
      </div>
      {error?.message && <p className="text-sm text-gray-500">{error.message}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, className = 'p-8' }) {
  return (
    <div className={`text-center ${className}`}>
      {Icon && <Icon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />}
      <h3 className="mt-4 text-xl font-medium">{title}</h3>
      {description && <p className="mt-2 text-gray-500 text-lg">{description}</p>}
    </div>
  );
}

/** Renders loading/error states, otherwise the children. */
export function AsyncSection({ loading, error, onRetry, errorMessage, children }) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={onRetry} message={errorMessage} />;
  return children;
}

/** Animated tab container + page heading used by every tab. */
export function TabFrame({ tabKey, title, subtitle, className, children }) {
  return (
    <motion.div
      key={tabKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
      </motion.div>
      {children}
    </motion.div>
  );
}
