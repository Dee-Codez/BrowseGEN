'use client';

import { useState } from 'react';
import BrowserStream from '@/components/BrowserStream';
import { CommandInput } from '@/components/CommandInput';

export default function InteractiveBrowser() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [debugUrl, setDebugUrl] = useState<string | null>(null);
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [overlayEnabled, setOverlayEnabled] = useState(true);

  const createSession = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/commands/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ injectOverlay: overlayEnabled }),
      });
      const data = await response.json();
      
      if (data.success) {
        setSessionId(data.sessionId);
        setDebugUrl(data.context.debugUrl);
        setWsUrl(data.context.wsUrl);
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create session. Make sure the API server is running.');
    } finally {
      setLoading(false);
    }
  };

  const closeSession = async () => {
    if (!sessionId) return;
    
    setLoading(true);
    try {
      await fetch(`http://localhost:3001/api/commands/session/${sessionId}`, {
        method: 'DELETE',
      });
      
      setSessionId(null);
      setDebugUrl(null);
      setWsUrl(null);
    } catch (error) {
      console.error('Failed to close session:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeCommand = async (command: string) => {
    if (!sessionId) {
      alert('Please create a session first');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          sessionId,
          useContext: true,
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to execute command:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Interactive Browser Control
          </h1>
          <p className="text-gray-400">
            Control a real browser with natural language and watch it in real-time
          </p>
        </div>

        {/* Session Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              {sessionId ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-white font-semibold">Session Active</span>
                  </div>
                  <p className="text-sm text-gray-400">ID: {sessionId.substring(0, 8)}...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-gray-400 block">No active session</span>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overlayEnabled}
                      onChange={(e) => setOverlayEnabled(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-300">
                      Enable command overlay in browser
                      <span className="text-gray-500 text-xs ml-1">(type commands directly in browser window)</span>
                    </span>
                  </label>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              {!sessionId ? (
                <button
                  onClick={createSession}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Browser Session'}
                </button>
              ) : (
                <button
                  onClick={closeSession}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {loading ? 'Closing...' : 'Close Session'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Command Input */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Command Center
              </h2>
              
              {sessionId ? (
                <CommandInput onExecute={executeCommand} />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-5xl mb-4">🚀</div>
                  <p>Create a session to start controlling the browser</p>
                </div>
              )}

              {/* Quick Commands */}
              {sessionId && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">
                    Quick Commands
                  </h3>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 mb-2">Single commands:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        'go to google.com',
                        'search for AI',
                        'go to github.com',
                        'scroll down',
                        'take a screenshot',
                        'go to reddit.com'
                      ].map((cmd) => (
                        <button
                          key={cmd}
                          onClick={() => executeCommand(cmd)}
                          className="text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300 transition-colors"
                        >
                          {cmd}
                        </button>
                      ))}
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-2 mt-4">Multi-step commands:</p>
                    <div className="space-y-2">
                      {[
                        'go to google.com, search for AI, click first result',
                        'go to github.com, search for playwright, click first repo',
                        'go to amazon.com, search for headphones, scroll down'
                      ].map((cmd) => (
                        <button
                          key={cmd}
                          onClick={() => executeCommand(cmd)}
                          className="text-left w-full px-3 py-2 bg-blue-900/30 hover:bg-blue-800/40 border border-blue-700/50 rounded text-sm text-blue-200 transition-colors"
                        >
                          {cmd}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-6 border border-blue-800/30">
              <h3 className="text-lg font-semibold text-white mb-3">
                💡 How it works
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">1.</span>
                  <span>Click "Create Browser Session" to launch a real browser on the server</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">2.</span>
                  <span>Type natural language commands like "go to google.com and search for AI"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">3.</span>
                  <span>Watch the AI agent execute commands with visual highlights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">4.</span>
                  <span>Open the Debug URL to interact with the browser directly if needed</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Browser Stream */}
          <div className="lg:col-span-1">
            {sessionId ? (
              <BrowserStream 
                sessionId={sessionId} 
                debugUrl={debugUrl || undefined}
                wsUrl={wsUrl || undefined}
              />
            ) : (
              <div className="bg-gray-800 rounded-lg h-full flex items-center justify-center p-12">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">🖥️</div>
                  <p className="text-lg">Browser view will appear here</p>
                  <p className="text-sm mt-2">Start a session to see live browser interaction</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
