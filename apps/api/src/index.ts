import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { commandRouter } from './routes/commands';
import { metricsRouter } from './routes/metrics';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/commands', commandRouter);
app.use('/api/metrics', metricsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});
