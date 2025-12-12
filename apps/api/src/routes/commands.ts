import { Router } from 'express';
import { processCommand } from '../services/nlp';
import { 
  executeCommand, 
  createSession, 
  closeSession, 
  getPageContext 
} from '../services/automation';
import { logMetric } from '../services/metrics';
import { v4 as uuidv4 } from 'uuid';

export const commandRouter = Router();

/**
 * @swagger
 * /api/commands:
 *   post:
 *     summary: Execute a natural language command
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               command:
 *                 type: string
 *                 example: "go to google.com and search for AI"
 *               url:
 *                 type: string
 *                 example: "https://google.com"
 *               sessionId:
 *                 type: string
 *                 example: "uuid-here"
 *               useContext:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Command executed successfully
 *       500:
 *         description: Error executing command
 *
 * /api/commands/session:
 *   post:
 *     summary: Create a new browser session
 *     responses:
 *       200:
 *         description: Session created
 *   delete:
 *     summary: Close a browser session
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session closed
 *
 * /api/commands/session/{sessionId}/context:
 *   get:
 *     summary: Get page context for a session
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Page context returned
 */

// Create a new interaction session
commandRouter.post('/session', async (req, res) => {
  try {
    const sessionId = uuidv4();
    console.log(`📱 Creating new browser session: ${sessionId}`);
    
    const context = await createSession(sessionId);
    
    console.log(`✅ Session created successfully`);
    console.log(`   - Session ID: ${sessionId}`);
    console.log(`   - Debug URL: ${context.debugUrl}`);
    console.log(`   - Page URL: ${context.url}`);
    
    res.json({
      sessionId,
      context,
      success: true,
    });
  } catch (error) {
    console.error('❌ Session creation error:', error);
    res.status(500).json({
      error: 'Failed to create session',
      message: (error as Error).message,
    });
  }
});

// Close a session
commandRouter.delete('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    await closeSession(sessionId);
    
    res.json({
      success: true,
      message: 'Session closed',
    });
  } catch (error) {
    console.error('Session close error:', error);
    res.status(500).json({
      error: 'Failed to close session',
      message: (error as Error).message,
    });
  }
});

// Execute a natural language command
commandRouter.post('/', async (req, res) => {
  try {
    const { command, url, sessionId, useContext = false } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    console.log(`\n🎬 Executing command: "${command}"`);
    if (sessionId) console.log(`   Session: ${sessionId}`);
    if (url) console.log(`   URL: ${url}`);

    // Get page context if requested (for better NLP understanding)
    let context;
    if (useContext && sessionId) {
      try {
        context = await getPageContext(sessionId);
        console.log(`   ✓ Page context retrieved`);
      } catch (e) {
        // Context is optional, continue without it
        console.log(`   ⚠ Could not get page context`);
      }
    }

    // Process natural language command
    console.log(`   🤖 Processing with GPT-4...`);
    const interpretation = await processCommand(command, url || '', context);
    console.log(`   ✓ Interpreted as: ${interpretation.action}`);
    if (interpretation.target) console.log(`   ✓ Target: ${interpretation.target}`);
    if (interpretation.confidence) console.log(`   ✓ Confidence: ${(interpretation.confidence * 100).toFixed(0)}%`);

    // Execute the command (if automation is enabled)
    let result;
    if (interpretation.executable) {
      console.log(`   ⚡ Executing action...`);
      result = await executeCommand(interpretation, sessionId);
      console.log(`   ✅ Action completed successfully`);
    } else {
      console.log(`   ⚠ Command not executable`);
    }

    // Log metrics
    await logMetric({
      command,
      url,
      sessionId,
      interpretation,
      success: true,
      timestamp: new Date(),
    });

    res.json({
      interpretation,
      result,
      sessionId,
      success: true,
    });
  } catch (error) {
    console.error('❌ Command execution error:', (error as Error).message);
    console.error((error as Error).stack);
    
    // Log failed metric
    await logMetric({
      command: req.body.command,
      url: req.body.url,
      sessionId: req.body.sessionId,
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

// Get context of current page in session
commandRouter.get('/session/:sessionId/context', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const context = await getPageContext(sessionId);
    
    res.json({
      context,
      success: true,
    });
  } catch (error) {
    console.error('Get context error:', error);
    res.status(500).json({
      error: 'Failed to get page context',
      message: (error as Error).message,
    });
  }
});
