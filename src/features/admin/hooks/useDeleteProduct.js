'use client';

import { useCallback, useState } from 'react';
import { api } from '@/lib/api-client';
import { errorMessage } from '../format';

/**
 * State for the "delete product" confirm dialog.
 * @param {() => void} onDeleted called after a successful delete (e.g. refetch lists)
 */
export function useDeleteProduct(onDeleted) {
  const [target, setTarget] = useState(null); // { id, name }
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const requestDelete = useCallback((product) => {
    setError(null);
    setTarget({ id: product.id, name: product.name });
  }, []);

  const cancel = useCallback(() => {
    if (deleting) return;
    setTarget(null);
    setError(null);
  }, [deleting]);

  const confirm = useCallback(async () => {
    if (!target) return;
    setDeleting(true);
    setError(null);
    try {
      await api.del(`/api/products/${target.id}`);
      setTarget(null);
      onDeleted?.();
    } catch (err) {
      setError(errorMessage(err, 'Failed to delete product'));
    } finally {
      setDeleting(false);
    }
  }, [target, onDeleted]);

  return { target, open: Boolean(target), deleting, error, requestDelete, cancel, confirm };
}
