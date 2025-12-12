import { Router } from 'express';
import { 
  createSession, 
  closeSession, 
} from '../services/automation';
import { runNaturalLanguageCommand } from '../services/commandExecutor';
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
    const injectOverlay = req.body?.injectOverlay === true;
    console.log(`📱 Creating new browser session: ${sessionId}${injectOverlay ? ' (with overlay)' : ''}`);
    
    const context = await createSession(sessionId, injectOverlay);
    
    console.log(`✅ Session created successfully`);
    console.log(`   - Session ID: ${sessionId}`);
    console.log(`   - Debug URL: ${context.debugUrl}`);
    console.log(`   - Page URL: ${context.url}`);
    console.log(`   - Overlay: ${injectOverlay ? 'Enabled' : 'Disabled'}`);
    
    res.json({
      sessionId,
      context,
      success: true,
      overlayEnabled: injectOverlay
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

    const payload = await runNaturalLanguageCommand({
      command,
      url,
      sessionId,
      useContext,
    });

    res.json({
      ...payload,
      sessionId,
      success: true,
    });
  } catch (error) {
    console.error('❌ Command execution error:', (error as Error).message);
    console.error((error as Error).stack);

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
