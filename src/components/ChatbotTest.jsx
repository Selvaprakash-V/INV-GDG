'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

export default function ChatbotTest() {
  const { data: session, status } = useSession();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  useEffect(() => {
    // Check if the chatbot script is loaded
    const checkScriptLoaded = () => {
      const scriptElements = document.querySelectorAll('script');
      for (let i = 0; i < scriptElements.length; i++) {
        if (scriptElements[i].src.includes('cdn.jotfor.ms/agent/embedjs/0196b5f2af5c735883b76155debbedf2e08c/embed.js')) {
          setScriptLoaded(true);
          return;
        }
      }
      setScriptLoaded(false);
    };
    
    checkScriptLoaded();
    
    // Check again after a short delay to account for async loading
    const timer = setTimeout(checkScriptLoaded, 2000);
    
    return () => clearTimeout(timer);
  }, [status]);
  
  const loadChatbotManually = () => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jotfor.ms/agent/embedjs/0196b5f2af5c735883b76155debbedf2e08c/embed.js?skipWelcome=1&maximizable=1';
    script.async = true;
    document.body.appendChild(script);
    
    setTimeout(() => {
      setScriptLoaded(true);
    }, 1000);
  };
  
  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Chatbot Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p><strong>Authentication Status:</strong> {status}</p>
            {session && (
              <p><strong>User Role:</strong> {session.user.role}</p>
            )}
          </div>
          
          <div>
            <p><strong>Chatbot Script Status:</strong> {scriptLoaded ? 'Loaded ✅' : 'Not Loaded ❌'}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {!scriptLoaded && (
          <Button onClick={loadChatbotManually} className="w-full">
            Load Chatbot Manually
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
