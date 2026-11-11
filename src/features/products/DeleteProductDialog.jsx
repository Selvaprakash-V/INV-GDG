'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

/** Confirm-before-delete dialog. The parent performs the delete and passes back `isDeleting`/`error`. */
export default function DeleteProductDialog({ onConfirm, isDeleting, error, disabled }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(next) => !isDeleting && setOpen(next)}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="bg-red-500 hover:bg-red-600" disabled={disabled}>
          <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete this product?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently remove the product from your inventory.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting} className="bg-red-500 hover:bg-red-600">
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
