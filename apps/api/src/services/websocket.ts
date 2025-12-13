import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import https from 'https';
import selfsigned from 'selfsigned';
import { fetch } from 'undici';

export interface ActionEvent {
  type: 'action' | 'screenshot' | 'log' | 'complete' | 'error';
  sessionId: string;
  timestamp: string;
  data: any;
}

class WebSocketService {
  private wssServers: WebSocketServer[] = [];
  private httpsServer: https.Server | null = null;
  private clients: Map<string, Set<WebSocket>> = new Map();
  private readonly apiPort = parseInt(process.env.PORT || '3001', 10);
  private readonly commandEndpoint = `http://localhost:${this.apiPort}/api/commands`;
  private readonly securePort = parseInt(process.env.WS_SECURE_PORT || '3443', 10);

  initialize(server: Server) {
    this.attachServer(server);
    this.startSecureServer();

    console.log('WebSocket server initialized on /ws');
  }

  private attachServer(server: Server) {
    const wss = new WebSocketServer({ server, path: '/ws' });
    this.wssServers.push(wss);
    wss.on('connection', (ws: WebSocket) => this.handleConnection(ws));
  }

  private startSecureServer() {
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const pems = selfsigned.generate(attrs, { days: 365 });
    this.httpsServer = https.createServer({ key: pems.private, cert: pems.cert });
    this.attachServer(this.httpsServer);
    this.httpsServer.listen(this.securePort, () => {
      console.log(`📡 Secure WebSocket server running on wss://localhost:${this.securePort}/ws`);
    });
  }

  private handleConnection(ws: WebSocket) {
    console.log('WebSocket client connected');
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());

        // Subscribe to session updates
        if (data.type === 'subscribe' && data.sessionId) {
          this.subscribe(data.sessionId, ws);
          ws.send(JSON.stringify({ 
            type: 'subscribed', 
            sessionId: data.sessionId 
          }));
        }

        // Unsubscribe from session
        if (data.type === 'unsubscribe' && data.sessionId) {
          this.unsubscribe(data.sessionId, ws);
        }

        if (data.type === 'command' && data.sessionId && data.command) {
          this.handleIncomingCommand(data.sessionId, data.command);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      // Remove client from all sessions
      this.clients.forEach((clients, sessionId) => {
        clients.delete(ws);
        if (clients.size === 0) {
          this.clients.delete(sessionId);
        }
      });
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  subscribe(sessionId: string, ws: WebSocket) {
    if (!this.clients.has(sessionId)) {
      this.clients.set(sessionId, new Set());
    }
    this.clients.get(sessionId)!.add(ws);
  }

  unsubscribe(sessionId: string, ws: WebSocket) {
    const clients = this.clients.get(sessionId);
    if (clients) {
      clients.delete(ws);
      if (clients.size === 0) {
        this.clients.delete(sessionId);
      }
    }
  }

  broadcast(sessionId: string, event: ActionEvent) {
    const clients = this.clients.get(sessionId);
    if (!clients) return;

    const message = JSON.stringify(event);
    
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  sendAction(sessionId: string, action: string, data: any) {
    this.broadcast(sessionId, {
      type: 'action',
      sessionId,
      timestamp: new Date().toISOString(),
      data: { action, ...data }
    });
  }

  sendScreenshot(sessionId: string, screenshot: string) {
    this.broadcast(sessionId, {
      type: 'screenshot',
      sessionId,
      timestamp: new Date().toISOString(),
      data: { screenshot }
    });
  }

  sendLog(sessionId: string, message: string, level: 'info' | 'error' | 'warning' = 'info') {
    this.broadcast(sessionId, {
      type: 'log',
      sessionId,
      timestamp: new Date().toISOString(),
      data: { message, level }
    });
  }

  sendComplete(sessionId: string, result: any) {
    this.broadcast(sessionId, {
      type: 'complete',
      sessionId,
      timestamp: new Date().toISOString(),
      data: result
    });
  }

  sendError(sessionId: string, error: string) {
    this.broadcast(sessionId, {
      type: 'error',
      sessionId,
      timestamp: new Date().toISOString(),
      data: { error }
    });
  }

  sendContextUpdate(sessionId: string, context: any) {
    this.broadcast(sessionId, {
      type: 'context-update',
      sessionId,
      timestamp: new Date().toISOString(),
      data: context
    });
  }

  sendThreadUpdate(sessionId: string, thread: any) {
    this.broadcast(sessionId, {
      type: 'thread',
      sessionId,
      timestamp: new Date().toISOString(),
      data: thread
    });
  }

  private async handleIncomingCommand(sessionId: string, command: string): Promise<void> {
    try {
      this.sendLog(sessionId, `Overlay command received: ${command}`);
      const response = await fetch(this.commandEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, sessionId, useContext: true }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const message = (data && (data as any).message) || 'Command execution failed';
        throw new Error(message);
      }
      this.sendLog(sessionId, 'Overlay command dispatched');
    } catch (error: any) {
      this.sendError(sessionId, error.message || 'Overlay command failed');
    }
  }
}

export const wsService = new WebSocketService();
