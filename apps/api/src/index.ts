import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { commandRouter } from './routes/commands';
import { metricsRouter } from './routes/metrics';
import { wsService } from './services/websocket';

// Swagger UI setup
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BrowseGEN Natural Language API',
      version: '1.0.0',
      description: 'Interact with websites using natural language prompts.'
    },
    servers: [
      { url: 'http://localhost:' + PORT }
    ]
  },
  apis: ['./src/routes/*.ts'], // Scan route files for JSDoc
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/commands', commandRouter);
app.use('/api/metrics', metricsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create HTTP server for WebSocket support
const server = createServer(app);

// Initialize WebSocket
wsService.initialize(server);

server.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server running on ws://localhost:${PORT}/ws`);
  console.log(`📖 API docs available at http://localhost:${PORT}/api/docs`);
});
