import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ArrowRight, Sparkles, Zap, MessageSquare, ExternalLink, X, Loader2 } from 'lucide-react';
import { HeroSection } from '../components/HeroSection';

interface Thread {
  id: string;
  sessionId: string;
  type: string;
  content: string;
  metadata?: any;
  createdAt: string;
}

// BrowseGEN specific components (you'll need to create these based on your existing components)
interface BrowserControlProps {
  sessionId: string;
  url: string;
  threads: Thread[];
  onClose: () => void;
}

const BrowserControl = ({ sessionId, url, threads, onClose }: BrowserControlProps) => {
  const [commandLoading, setCommandLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const executeCommand = async (command: string) => {
    setCommandLoading(true);
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
      return await response.json();
    } catch (error) {
      console.error('Failed to execute command:', error);
      throw error;
    } finally {
      setCommandLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden relative z-10"
      style={{
        background: 'rgba(31, 41, 55, 0.5)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(75, 85, 99, 0.5)',
        boxShadow: '0 25px 50px -12px rgba(6, 182, 212, 0.1)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Connected to</span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
            >
              {url.replace(/^https?:\/\//, '').substring(0, 40)}
              {url.length > 40 && '...'}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Browser iframe or stream would go here */}
      <div className="h-[500px] bg-gray-900/50 flex flex-col">
        {/* Threads Display */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {threads.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <div className="text-4xl mb-4">🌐</div>
              <p className="text-gray-400">Browser Control Interface</p>
              <p className="text-sm text-gray-500 mt-2">Session ID: {sessionId.substring(0, 8)}...</p>
            </div>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.id}
                className={`p-3 rounded-lg ${
                  thread.type === 'command'
                    ? 'bg-cyan-900/30 border border-cyan-700/50'
                    : thread.type === 'response'
                    ? 'bg-blue-900/30 border border-blue-700/50'
                    : 'bg-gray-800/50 border border-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold uppercase ${
                    thread.type === 'command'
                      ? 'text-cyan-400'
                      : thread.type === 'response'
                      ? 'text-blue-400'
                      : 'text-gray-400'
                  }`}>
                    {thread.type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(thread.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">
                  {thread.type === 'response' && thread.content.startsWith('{')
                    ? JSON.stringify(JSON.parse(thread.content), null, 2)
                    : thread.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Command Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder={commandLoading ? "Processing..." : "Type a command..."}
            disabled={commandLoading}
            className="w-full px-4 py-3 pr-12 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !commandLoading) {
                const value = e.currentTarget.value;
                if (value.trim()) {
                  executeCommand(value);
                  e.currentTarget.value = '';
                }
              }
            }}
          />
          {commandLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 text-cyan-500 animate-spin" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function InteractiveBrowser() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch threads for the session
  const fetchThreads = async (sid: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/commands/session/${sid}/threads`);
      const data = await response.json();
      if (data.success) {
        setThreads(data.threads);
      }
    } catch (error) {
      console.error('Failed to fetch threads:', error);
    }
  };

  // Connect to WebSocket and listen for thread updates
  useEffect(() => {
    if (!sessionId) return;

    const ws = new WebSocket('ws://localhost:3001/ws');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      // Subscribe to session updates
      ws.send(JSON.stringify({ type: 'subscribe', sessionId }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle thread updates
        if (data.type === 'thread') {
          setThreads((prev) => [...prev, data.data]);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    // Fetch initial threads
    fetchThreads(sessionId);

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'unsubscribe', sessionId }));
      }
      ws.close();
    };
  }, [sessionId]);

  const handleUrlSubmit = async (submittedUrl: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/commands/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ injectOverlay: true }),
      });
      const data = await response.json();
      
      if (data.success) {
        setSessionId(data.sessionId);
        setUrl(submittedUrl);
        
        // Navigate to URL
        setTimeout(async () => {
          await fetch('http://localhost:3001/api/commands', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              command: `go to ${submittedUrl}`,
              sessionId: data.sessionId,
              useContext: true,
            }),
          });
        }, 500);
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create session. Make sure the API server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSession = async () => {
    if (!sessionId) return;
    
    try {
      // Close WebSocket connection
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      await fetch(`http://localhost:3001/api/commands/session/${sessionId}`, {
        method: 'DELETE',
      });
      setSessionId(null);
      setUrl('');
      setThreads([]);
    } catch (error) {
      console.error('Failed to close session:', error);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0f1e]">
      <AnimatePresence mode="wait">
        {!sessionId ? (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HeroSection onSubmit={handleUrlSubmit} isLoading={loading} />
          </motion.div>
        ) : (
          <motion.div
            key="browser"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center p-4"
          >
            {/* Background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(6, 182, 212, 0.08)' }} />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(59, 130, 246, 0.08)' }} />
            </div>

            <BrowserControl sessionId={sessionId} url={url} threads={threads} onClose={handleCloseSession} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
