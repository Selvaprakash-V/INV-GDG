// src/app/customerdashboard/components/CustomerStats.jsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Package, CheckCircle, XCircle } from 'lucide-react';

export default function CustomerStats({ inventoryData }) {
  const stats = {
    totalItems: inventoryData.length,
    availableItems: inventoryData.filter(item => item.stock > 0).length,
    outOfStock: inventoryData.filter(item => item.stock === 0).length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-purple-100 border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <h3 className="text-2xl font-bold text-purple-600">{stats.totalItems}</h3>
            </div>
            <div className="p-3 rounded-full bg-purple-600/20">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-100 border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <h3 className="text-2xl font-bold text-green-600">{stats.availableItems}</h3>
            </div>
            <div className="p-3 rounded-full bg-green-600/20">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-red-100 border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <h3 className="text-2xl font-bold text-red-600">{stats.outOfStock}</h3>
            </div>
            <div className="p-3 rounded-full bg-red-600/20">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}