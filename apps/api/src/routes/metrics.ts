import { Router } from 'express';
import { getMetricsSummary, getCommandHistory } from '../services/metrics';

export const metricsRouter = Router();

metricsRouter.get('/', async (req, res) => {
  try {
    const summary = await getMetricsSummary();
    res.json(summary);
  } catch (error) {
    console.error('Metrics retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve metrics',
      message: (error as Error).message,
    });
  }
});

metricsRouter.get('/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const history = await getCommandHistory(limit);
    res.json(history);
  } catch (error) {
    console.error('History retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve history',
      message: (error as Error).message,
    });
  }
});
