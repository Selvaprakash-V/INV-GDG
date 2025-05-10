'use client';

import { SessionProvider } from 'next-auth/react';
import ChatbotScript from '@/components/ChatbotScript';

export function Providers({ children }) {
  return (
    <SessionProvider>
      {children}
      <ChatbotScript />
    </SessionProvider>
  );
}
