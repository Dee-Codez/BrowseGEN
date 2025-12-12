'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface CommandInputProps {
  onExecute?: (command: string) => Promise<any>;
}

export function CommandInput({ onExecute }: CommandInputProps) {
  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      if (onExecute) {
        const response = await onExecute(command.trim());
        setResult(response);
      }
      setCommand(''); // Clear input after execution
    } catch (err: any) {
      setError(err.message || 'Failed to execute command');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Enter Your Command
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="e.g., 'Click on the login button' or 'Fill out the contact form with my information'"
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none resize-none"
              rows={4}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !command.trim()}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Execute Command
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 p-6 bg-green-50 border-l-4 border-green-500 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Success!</h3>
            <pre className="text-sm text-green-700 whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold text-gray-800 mb-2">🎯 Smart Commands</h3>
          <p className="text-sm text-gray-600">
            Use natural language to interact with any website
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold text-gray-800 mb-2">⚡ Real-time</h3>
          <p className="text-sm text-gray-600">
            Execute commands instantly with AI-powered automation
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold text-gray-800 mb-2">📊 Analytics</h3>
          <p className="text-sm text-gray-600">
            Track usage patterns and optimize your workflows
          </p>
        </div>
      </div>
    </div>
  );
}
