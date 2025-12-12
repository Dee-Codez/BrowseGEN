import { Router } from 'express';
import { processCommand } from '../services/nlp';
import { executeCommand } from '../services/automation';
import { logMetric } from '../services/metrics';

export const commandRouter = Router();

commandRouter.post('/', async (req, res) => {
  try {
    const { command, url } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    // Process natural language command
    const interpretation = await processCommand(command, url);

    // Execute the command (if automation is enabled)
    let result;
    if (interpretation.executable) {
      result = await executeCommand(interpretation);
    }

    // Log metrics
    await logMetric({
      command,
      url,
      interpretation,
      success: true,
      timestamp: new Date(),
    });

    res.json({
      interpretation,
      result,
      success: true,
    });
  } catch (error) {
    console.error('Command execution error:', error);
    
    // Log failed metric
    await logMetric({
      command: req.body.command,
      url: req.body.url,
      success: false,
      error: (error as Error).message,
      timestamp: new Date(),
    });

    res.status(500).json({
      error: 'Failed to execute command',
      message: (error as Error).message,
    });
  }
});
