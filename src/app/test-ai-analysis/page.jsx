'use client';

import { useState } from 'react';

export default function TestAIAnalysis() {
  const [activeTab, setActiveTab] = useState('sales');

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">AI Analysis Test Page</h1>

      <div className="mb-6">
        <div className="flex space-x-4 border-b">
          <button
            className={`py-2 px-4 ${activeTab === 'sales' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('sales')}
          >
            Sales Forecast
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'expiry' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('expiry')}
          >
            Expiry Risk
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'recommendations' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            onClick={() => setActiveTab('recommendations')}
          >
            Recommendations
          </button>
        </div>
      </div>

      {activeTab === 'sales' && (
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Sales Forecast</h2>
          <p className="mb-4">This tab would display sales forecasting data, trends, and predictions.</p>
          <div className="h-40 bg-gray-100 rounded flex items-center justify-center">
            [Sales Chart Visualization]
          </div>
        </div>
      )}

      {activeTab === 'expiry' && (
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Expiry Risk Analysis</h2>
          <p className="mb-4">This tab would display products at risk of expiring and mitigation strategies.</p>
          <div className="h-40 bg-gray-100 rounded flex items-center justify-center">
            [Expiry Risk Visualization]
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">AI Recommendations</h2>
          <p className="mb-4">This tab would display AI-generated recommendations for inventory optimization.</p>
          <div className="h-40 bg-gray-100 rounded flex items-center justify-center">
            [Recommendations Visualization]
          </div>
        </div>
      )}
    </div>
  );
}
