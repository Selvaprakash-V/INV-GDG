'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function ChatbotScript() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Only add the script if the user is authenticated (both Administrator and Customer)
    if (status === 'authenticated') {
      // Create script element with the exact script tag provided
      const script = document.createElement('script');
      script.src = 'https://cdn.jotfor.ms/agent/embedjs/0196b5f2af5c735883b76155debbedf2e08c/embed.js?skipWelcome=1&maximizable=1';
      script.async = true;

      // Append to body
      document.body.appendChild(script);

      console.log(`Chatbot script loaded for ${session?.user?.role || 'authenticated user'}`);

      // Cleanup function to remove script when component unmounts
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
          console.log('Chatbot script removed');
        }
      };
    }
  }, [status, session]); // Re-run effect when authentication status or session changes

  // This component doesn't render anything visible
  return null;
}
