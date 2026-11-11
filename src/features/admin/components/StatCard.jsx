'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

export default function StatCard({ title, value, icon, textColor, loading = false }) {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
      <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              {loading ? (
                <div className="h-8 w-16 mt-1 rounded bg-gray-200 animate-pulse" aria-label="Loading" />
              ) : (
                <h3 className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</h3>
              )}
            </div>
            <div className="p-3 rounded-full bg-gray-50">{icon}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
