'use client';

import { SessionProvider } from 'next-auth/react';
import ChatbotScript from './ChatbotScript';

export default function SessionWrapper({ children }) {
  return (
    <SessionProvider>
      {children}
      <ChatbotScript />
    </SessionProvider>
  );
}
