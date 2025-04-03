'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useState } from 'react';
import { Mail, Lock, User, Store, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!selectedRole || !email || !password) {
      setError('Please fill all fields correctly!');
      setIsSubmitting(false);
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // On successful login
    console.log(`Logged in as ${selectedRole}`);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="text-center">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                {selectedRole === 'Administrator' ? (
                  <Store className="w-6 h-6 text-purple-600" />
                ) : (
                  <User className="w-6 h-6 text-purple-600" />
                )}
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to your {selectedRole || 'account'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div className="flex gap-2 mb-4">
                <motion.div whileHover={{ scale: 1.03 }}>
                  <Button
                    type="button"
                    variant={selectedRole === 'Administrator' ? 'default' : 'outline'}
                    className={`w-full ${selectedRole === 'Administrator' ? 'bg-purple-600 text-white' : ''}`}
                    onClick={() => handleRoleSelect('Administrator')}
                  >
                    <Store className="w-4 h-4 mr-2" />
                    Administrator
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }}>
                  <Button
                    type="button"
                    variant={selectedRole === 'Customer' ? 'default' : 'outline'}
                    className={`w-full ${selectedRole === 'Customer' ? 'bg-purple-600 text-white' : ''}`}
                    onClick={() => handleRoleSelect('Customer')}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Customer
                  </Button>
                </motion.div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-md"
                >
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </motion.div>
              )}

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>
              </motion.div>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col items-center gap-2">
            <Link
              href="/forgot-password"
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              Forgot password?
            </Link>
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                href="/role"
                className="text-purple-600 font-medium hover:text-purple-700"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}