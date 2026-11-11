'use client';

import { AlertCircle, Package, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { errorMessage } from '../format';

export function LoadingState({ label = 'Loading…', className = 'py-12' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`} role="status">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600" aria-hidden="true" />
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  );
}

export function ErrorState({ error, title = 'Could not load data', onRetry, className = 'py-10' }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center gap-2 px-4 ${className}`} role="alert">
      <AlertCircle className="h-8 w-8 text-red-500" aria-hidden="true" />
      <h3 className="font-semibold text-red-700">{title}</h3>
      <p className="text-sm text-red-600 max-w-md">{errorMessage(error)}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, icon: Icon = Package, tone = 'green', action, className = 'py-12' }) {
  const toneClasses = tone === 'green' ? 'bg-green-50 text-green-500' : 'bg-gray-100 text-gray-400';
  return (
    <div className={`flex flex-col items-center justify-center text-center px-4 ${className}`}>
      <div className={`p-3 rounded-full mb-4 ${toneClasses}`}>
        <Icon className="h-8 w-8" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      {description && <p className="text-gray-500 max-w-md mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/**
 * Renders loading / error / empty / content for one data block.
 * Keeps showing stale content while a refetch is in flight.
 */
export function DataBlock({ loading, error, data, isEmpty, onRetry, empty, loadingLabel, errorTitle, children }) {
  if (error && !data) return <ErrorState error={error} title={errorTitle} onRetry={onRetry} />;
  if (!data) return loading ? <LoadingState label={loadingLabel} /> : null;
  if (isEmpty) return empty ?? null;
  return children;
}
