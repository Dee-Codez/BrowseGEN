'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'];

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get('/api/metrics');
        setMetrics(response.data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const commandsData = [
    { name: 'Mon', commands: 45 },
    { name: 'Tue', commands: 52 },
    { name: 'Wed', commands: 61 },
    { name: 'Thu', commands: 48 },
    { name: 'Fri', commands: 70 },
    { name: 'Sat', commands: 35 },
    { name: 'Sun', commands: 28 },
  ];

  const usageData = [
    { name: 'Click Actions', value: 35 },
    { name: 'Form Fills', value: 25 },
    { name: 'Navigation', value: 20 },
    { name: 'Data Extract', value: 20 },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="text-sm text-gray-600 mb-1">Total Commands</div>
          <div className="text-3xl font-bold text-gray-800">1,284</div>
          <div className="text-sm text-green-600 mt-2">+12% this week</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="text-sm text-gray-600 mb-1">Success Rate</div>
          <div className="text-3xl font-bold text-gray-800">94.2%</div>
          <div className="text-sm text-green-600 mt-2">+2.1% from last week</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="text-sm text-gray-600 mb-1">Active Users</div>
          <div className="text-3xl font-bold text-gray-800">342</div>
          <div className="text-sm text-green-600 mt-2">+18 new users</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="text-sm text-gray-600 mb-1">Avg Response Time</div>
          <div className="text-3xl font-bold text-gray-800">1.2s</div>
          <div className="text-sm text-green-600 mt-2">-0.3s improvement</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Commands Per Day
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={commandsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="commands" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Command Types Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={usageData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {usageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Popular Websites
        </h3>
        <div className="space-y-3">
          {[
            { site: 'linkedin.com', count: 245 },
            { site: 'amazon.com', count: 198 },
            { site: 'google.com', count: 156 },
            { site: 'github.com', count: 134 },
            { site: 'facebook.com', count: 112 },
          ].map((item) => (
            <div key={item.site} className="flex items-center justify-between">
              <span className="text-gray-700">{item.site}</span>
              <div className="flex items-center gap-3">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${(item.count / 245) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {item.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
