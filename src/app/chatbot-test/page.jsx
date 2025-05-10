'use client';

import SessionWrapper from '@/components/SessionWrapper';
import AuthenticatedLayout from '@/app/AuthenticatedLayout';
import ChatbotTest from '@/components/ChatbotTest';

export default function ChatbotTestPage() {
  return (
    <SessionWrapper>
      <AuthenticatedLayout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-8">
          <h1 className="text-3xl font-bold text-center mb-8">Chatbot Integration Test</h1>
          <ChatbotTest />
        </div>
      </AuthenticatedLayout>
    </SessionWrapper>
  );
}
