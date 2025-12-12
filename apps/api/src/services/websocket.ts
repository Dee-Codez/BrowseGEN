import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

export interface ActionEvent {
  type: 'action' | 'screenshot' | 'log' | 'complete' | 'error';
  sessionId: string;
  timestamp: string;
  data: any;
}

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Set<WebSocket>> = new Map();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req) => {
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
    });

    console.log('WebSocket server initialized on /ws');
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
}

export const wsService = new WebSocketService();
