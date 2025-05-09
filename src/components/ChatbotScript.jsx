'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function ChatbotScript() {
  const { status } = useSession();
  
  useEffect(() => {
    // Only add the script if the user is authenticated
    if (status === 'authenticated') {
      // Create script element
      const script = document.createElement('script');
      script.src = 'https://cdn.jotfor.ms/agent/embedjs/0196b5f2af5c735883b76155debbedf2e08c/embed.js?skipWelcome=1&maximizable=1';
      script.async = true;
      
      // Append to body
      document.body.appendChild(script);
      
      // Cleanup function to remove script when component unmounts
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [status]); // Re-run effect when authentication status changes
  
  // This component doesn't render anything visible
  return null;
}
