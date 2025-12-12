'use client';

import { useEffect, useRef, useState } from 'react';

interface BrowserStreamProps {
  sessionId: string;
  debugUrl?: string;
  wsUrl?: string;
}

interface ActionEvent {
  type: 'action' | 'screenshot' | 'log' | 'complete' | 'error';
  sessionId: string;
  timestamp: string;
  data: any;
}

export default function BrowserStream({ sessionId, debugUrl, wsUrl }: BrowserStreamProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    const ws = new WebSocket('ws://localhost:3001/ws');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
      // Subscribe to session updates
      ws.send(JSON.stringify({ type: 'subscribe', sessionId }));
    };

    ws.onmessage = (event) => {
      try {
        const message: ActionEvent = JSON.parse(event.data);
        
        switch (message.type) {
          case 'action':
            addLog(`🎬 Action: ${message.data.action} - ${message.data.target || ''}`);
            break;
          case 'log':
            addLog(`📝 ${message.data.message}`);
            break;
          case 'complete':
            addLog(`✅ Complete: ${JSON.stringify(message.data)}`);
            break;
          case 'error':
            addLog(`❌ Error: ${message.data.error}`, true);
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'unsubscribe', sessionId }));
        ws.close();
      }
    };
  }, [sessionId]);

  const addLog = (message: string, isError = false) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Browser Stream Display */}
      <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden relative">
        {debugUrl && (
          <div className="absolute top-2 left-2 z-10 bg-black/80 text-white px-3 py-1 rounded text-sm">
            {connected ? '🟢 Live' : '🔴 Disconnected'}
          </div>
        )}
        
        {debugUrl ? (
          <div className="h-full flex flex-col items-center justify-center p-4 gap-4">
            <div className="text-center text-white">
              <h3 className="text-xl font-semibold mb-2">Browser Instance Running</h3>
              <p className="text-gray-400 mb-4">
                A visible browser window has opened on the server.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Debug URL: <code className="bg-gray-800 px-2 py-1 rounded">{debugUrl}</code>
              </p>
              
              {/* Option 1: Open in new window */}
              <a
                href={debugUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg mb-4"
              >
                Open Browser DevTools in New Tab
              </a>
              
              <div className="text-sm text-gray-400 mt-6">
                <p>💡 The browser window is visible on the server.</p>
                <p>You can see all AI agent actions happen in real-time!</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-6xl mb-4">🌐</div>
              <p>No active browser session</p>
              <p className="text-sm mt-2">Create a session to start</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Logs */}
      <div className="bg-gray-800 rounded-lg p-4 h-64 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-semibold">Activity Log</h3>
          {connected && <span className="text-green-400 text-sm">● Live</span>}
        </div>
        <div className="space-y-1 font-mono text-sm">
          {logs.length === 0 ? (
            <p className="text-gray-500">Waiting for actions...</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="text-gray-300 hover:bg-gray-700 px-2 py-1 rounded">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
