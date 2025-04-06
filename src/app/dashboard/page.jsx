'use client';

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';



Chart.register(...registerables);

export default function InventoryDashboard() {
    const stockChartRef = useRef(null);
    const salesChartRef = useRef(null);
    const stockChartInstance = useRef(null);
    const salesChartInstance = useRef(null);

    useEffect(() => {
        if (stockChartRef.current) {
            if (stockChartInstance.current) stockChartInstance.current.destroy(); // Destroy previous chart
            stockChartInstance.current = new Chart(stockChartRef.current, {
                type: 'bar',
                data: {
                    labels: ['Electronics', 'Clothing', 'Groceries', 'Accessories', 'Furniture'],
                    datasets: [{
                        label: 'Stock Quantity',
                        data: [80, 50, 100, 40, 30],
                        backgroundColor: ['#FFD700', '#FF5733', '#28B463', '#3498DB', '#8E44AD']
                    }]
                }
            });
        }

        if (salesChartRef.current) {
            if (salesChartInstance.current) salesChartInstance.current.destroy(); // Destroy previous chart
            salesChartInstance.current = new Chart(salesChartRef.current, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Sales ($)',
                        data: [5000, 7000, 8000, 12000, 15000, 20000],
                        borderColor: '#38bdf8',
                        borderWidth: 2,
                        fill: false
                    }]
                }
            });
        }

        // Cleanup on unmount
        return () => {
            if (stockChartInstance.current) stockChartInstance.current.destroy();
            if (salesChartInstance.current) salesChartInstance.current.destroy();
        };
    }, []);

    return (
        <div className="flex">
            {/* Sidebar */}
            <div className="w-64 h-screen bg-gray-900 text-white p-5 fixed">
                <h2 className="text-yellow-400 text-2xl font-bold">Inventory Dashboard</h2>
                <ul className="mt-6 space-y-4">
                    <li className="hover:text-yellow-400 cursor-pointer">📊 Overview</li>
                    <li className="hover:text-yellow-400 cursor-pointer">📦 Inventory</li>
                    <li className="hover:text-yellow-400 cursor-pointer">📈 Sales</li>
                    <li className="hover:text-yellow-400 cursor-pointer">⚙️ Settings</li>
                    <li className="hover:text-red-400 cursor-pointer">🚪 Logout</li>
                </ul>
            </div>

            {/* Main Content */}
            <div className="ml-72 p-6 w-full">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Inventory Overview</h1>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {['Total Products', 'Low Stock Items', 'Out of Stock', 'Expiring Soon'].map((title, index) => (
                        <div key={index} className="bg-white p-5 rounded-lg shadow-md text-center">
                            <h3 className="text-xl font-semibold text-gray-700">{title}</h3>
                            <p className={`text-3xl font-bold ${index === 1 ? 'text-red-500' : index === 3 ? 'text-orange-500' : 'text-yellow-500'}`}>{[150, 12, 5, 8][index]}</p>
                        </div>
                    ))}
                </div>

                {/* Analytics Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white p-5 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">Stock Levels</h3>
                        <canvas ref={stockChartRef}></canvas>
                    </div>
                    <div className="bg-white p-5 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">Sales Trends</h3>
                        <canvas ref={salesChartRef}></canvas>
                    </div>
                </div>
            </div>
        </div>
    );
}
