'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

export default function LoginTest() {
  const [testUsers, setTestUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function createTestUsers() {
      try {
        setLoading(true);
        const response = await fetch('/api/create-test-user');
        const data = await response.json();
        
        if (data.success) {
          setTestUsers(data);
        } else {
          setError(data.message || 'Failed to create test users');
        }
      } catch (err) {
        setError('An error occurred while creating test users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    createTestUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Login Test Page</CardTitle>
          <CardDescription className="text-center">
            Use these credentials to test the login functionality
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading test users...</div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">{error}</div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                <h3 className="font-bold text-lg mb-2">Administrator Account</h3>
                <p><span className="font-medium">Email:</span> {testUsers?.adminCredentials?.email}</p>
                <p><span className="font-medium">Password:</span> {testUsers?.adminCredentials?.password}</p>
                <p><span className="font-medium">Role:</span> Administrator</p>
              </div>
              
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <h3 className="font-bold text-lg mb-2">Customer Account</h3>
                <p><span className="font-medium">Email:</span> {testUsers?.customerCredentials?.email}</p>
                <p><span className="font-medium">Password:</span> {testUsers?.customerCredentials?.password}</p>
                <p><span className="font-medium">Role:</span> Customer</p>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Link href="/login">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Go to Login Page
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
