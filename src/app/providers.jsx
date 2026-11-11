'use client';

import { SessionProvider } from 'next-auth/react';
import { MotionConfig } from 'framer-motion';
import ChatbotScript from '@/components/ChatbotScript';

// Single SessionProvider for the whole app (pages used to nest a second one,
// which also injected the chatbot script twice).
export function Providers({ children }) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <MotionConfig reducedMotion="user">
        {children}
        <ChatbotScript />
      </MotionConfig>
    </SessionProvider>
  );
}
