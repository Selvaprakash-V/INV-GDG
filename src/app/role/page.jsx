'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Store, User } from 'lucide-react';

export default function RoleSelection() {
  const roles = [
    {
      title: "Administrator",
      description: "Manage your supermarket inventory and track expiry dates",
      icon: <Store className="w-12 h-12 text-purple-600" />,
      href: "/administratorsignup",
      bgColor: "bg-purple-100",
      hoverColor: "hover:bg-purple-200"
    },
    {
      title: "Customer",
      description: "Track your purchases and receive expiry alerts",
      icon: <User className="w-12 h-12 text-purple-600" />,
      href: "/customersignup",
      bgColor: "bg-purple-50",
      hoverColor: "hover:bg-purple-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Select Your <span className="text-purple-600">Role</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Choose whether you're a supermarket administrator or a customer
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto w-full">
        {roles.map((role, index) => (
          <motion.div
            key={role.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="w-full"
          >
            <Card className={`h-full border border-gray-200 hover:border-purple-300 transition-all duration-300 shadow-sm hover:shadow-md ${role.bgColor} ${role.hoverColor}`}>
              <CardHeader className="items-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="p-4 bg-white rounded-full shadow-sm"
                >
                  {role.icon}
                </motion.div>
                <CardTitle className="text-2xl text-gray-800 mt-4">
                  {role.title}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {role.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Link href={role.href} className="w-full">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      Continue as {role.title}
                    </Button>
                  </motion.div>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 text-gray-600"
      >
        Already have an account?{' '}
        <Link href="/login" className="text-purple-600 font-medium hover:text-purple-700">
          Login here
        </Link>
      </motion.div>
    </div>
  );
}