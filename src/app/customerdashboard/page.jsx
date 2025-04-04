// src/app/customerdashboard/page.jsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import CustomerStats from '@/components/ui/CustomerStats';
import CustomerInventoryTable from '@/components/ui/CustomerInventoryTable';

export default function CustomerDashboard() {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample inventory data (simplified for customers)
  const inventoryData = [
    { id: 1, name: 'Organic Apples', category: 'Fruits', stock: 150, price: '$2.99' },
    { id: 2, name: 'Whole Grain Bread', category: 'Bakery', stock: 42, price: '$3.49' },
    { id: 3, name: 'Almond Milk', category: 'Dairy', stock: 0, price: '$4.29' },
    { id: 4, name: 'Free Range Eggs', category: 'Dairy', stock: 89, price: '$5.99' },
    { id: 5, name: 'Greek Yogurt', category: 'Dairy', stock: 23, price: '$1.99' },
    { id: 6, name: 'Organic Spinach', category: 'Vegetables', stock: 56, price: '$2.49' },
    { id: 7, name: 'Quinoa', category: 'Grains', stock: 34, price: '$6.99' },
  ];

  // Filter data based on search
  const filteredData = inventoryData.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 text-gray-800 font-sans">
      {/* Main Content */}
      <div className="pt-16">
        <main className="p-6">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Product Catalog</h1>
            <p className="text-gray-600 mt-2">Browse our available products</p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                className="pl-10 bg-white shadow-sm border border-gray-200 focus:border-purple-300 max-w-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Stats Overview */}
          <CustomerStats inventoryData={inventoryData} />

          {/* Inventory Table */}
          <CustomerInventoryTable filteredData={filteredData} />
        </main>
      </div>
    </div>
  );
}