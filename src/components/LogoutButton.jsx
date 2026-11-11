'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LogoutButton({ className, variant = 'outline', size = 'sm' }) {
  return (
    <Button variant={variant} size={size} className={className} onClick={() => signOut({ callbackUrl: '/login' })}>
      <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
      Log out
    </Button>
  );
}
