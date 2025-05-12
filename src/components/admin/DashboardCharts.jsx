'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { BarChart2, PieChart as PieChartIcon, Package, AlertCircle, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Import recharts components directly
import {
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';

// Chart wrapper component to handle dynamic imports
const ChartWrapper = ({ children }) => {
  return (
    <div className="w-full h-full">
      {typeof window === 'undefined' ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export const StockTrendChart = ({ data }) => {
  if (typeof window === 'undefined') {
    return <div className="h-80 flex items-center justify-center">Loading chart...</div>;
  }

  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <CardTitle className="flex items-center text-blue-800">
          <BarChart2 className="mr-2 h-5 w-5 text-blue-600" />
          Stock Trend
        </CardTitle>
        <CardDescription>
          Total inventory stock levels over time
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 h-80">
        <ChartWrapper>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value) => [`${value} units`, 'Total Stock']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="stock"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#stockGradient)"
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </CardContent>
    </Card>
  );
};

export const StockLevelDistributionChart = ({ data }) => {
  if (typeof window === 'undefined') {
    return <div className="h-80 flex items-center justify-center">Loading chart...</div>;
  }

  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
        <CardTitle className="flex items-center text-purple-800">
          <PieChartIcon className="mr-2 h-5 w-5 text-purple-600" />
          Stock Level Distribution
        </CardTitle>
        <CardDescription>
          Products by stock level categories
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 h-80">
        <ChartWrapper>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} products`, 'Count']}
                contentStyle={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </CardContent>
    </Card>
  );
};

export const CategoryStockChart = ({ data }) => {
  if (typeof window === 'undefined') {
    return <div className="h-80 flex items-center justify-center">Loading chart...</div>;
  }

  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b border-green-100">
        <CardTitle className="flex items-center text-green-800">
          <BarChart2 className="mr-2 h-5 w-5 text-green-600" />
          Stock by Category
        </CardTitle>
        <CardDescription>
          Total stock units per product category
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 h-80">
        <ChartWrapper>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value) => [`${value} units`, 'Stock']}
              />
              <Bar dataKey="stock" fill="#10b981" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 30 + 150}, 70%, 50%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </CardContent>
    </Card>
  );
};

export const TopProductsChart = ({ data }) => {
  if (typeof window === 'undefined') {
    return <div className="h-80 flex items-center justify-center">Loading chart...</div>;
  }

  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100">
        <CardTitle className="flex items-center text-amber-800">
          <Package className="mr-2 h-5 w-5 text-amber-600" />
          Top Products by Stock
        </CardTitle>
        <CardDescription>
          Products with highest inventory levels
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 h-80">
        <ChartWrapper>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#888" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="#888" fontSize={12} width={100} />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value) => [`${value} units`, 'Stock']}
              />
              <Bar dataKey="stock" fill="#f59e0b" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${40 + index * 5}, 90%, ${60 - index * 5}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </CardContent>
    </Card>
  );
};
