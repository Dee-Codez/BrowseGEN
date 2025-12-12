'use client';

import { useState } from 'react';
import { CommandInput } from '@/components/CommandInput';
import { MetricsDashboard } from '@/components/MetricsDashboard';
import { Globe, BarChart3 } from 'lucide-react';

export default function Home() {
  const [view, setView] = useState<'command' | 'metrics'>('command');

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-10 h-10 text-primary" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                NaturalWeb
              </h1>
            </div>
            <nav className="flex gap-4">
              <button
                onClick={() => setView('command')}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  view === 'command'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Commands
              </button>
              <button
                onClick={() => setView('metrics')}
                className={`px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  view === 'metrics'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
            </nav>
          </div>
        </header>

        {view === 'command' ? <CommandInput /> : <MetricsDashboard />}
      </div>
    </main>
  );
}
