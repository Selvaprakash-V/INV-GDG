'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

const CHATBOT_SRC =
  'https://cdn.jotfor.ms/agent/embedjs/0196b5f2af5c735883b76155debbedf2e08c/embed.js?skipWelcome=1&maximizable=1';
const SCRIPT_ID = 'trackit-chatbot';

/** Loads the Jotform AI agent once for signed-in users. */
export default function ChatbotScript() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== 'authenticated' || document.getElementById(SCRIPT_ID)) return undefined;
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = CHATBOT_SRC;
    script.async = true;
    document.body.appendChild(script);
    return () => script.remove();
  }, [status]);

  return null;
}
