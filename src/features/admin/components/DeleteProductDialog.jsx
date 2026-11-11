'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

/** Confirm dialog driven by useDeleteProduct(). */
export default function DeleteProductDialog({ open, target, deleting, error, cancel, confirm }) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && cancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete {target?.name ? `"${target.name}"` : 'this product'}?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently remove the product from your inventory.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={cancel} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirm} disabled={deleting} className="bg-red-500 hover:bg-red-600">
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
