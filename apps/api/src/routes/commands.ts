import { Router } from 'express';
import { 
  createSession, 
  closeSession, 
  getPageContext,
} from '../services/automation';
import { runNaturalLanguageCommand } from '../services/commandExecutor';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { wsService } from '../services/websocket';

const prisma = new PrismaClient();

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
    const initialUrl = req.body?.initialUrl as string | undefined;
    console.log(`📱 Creating new browser session: ${sessionId}${injectOverlay ? ' (with overlay)' : ''}${initialUrl ? ` -> ${initialUrl}` : ''}`);
    
    const context = await createSession(sessionId, injectOverlay, initialUrl);
    
    // Create session in database
    await prisma.session.create({
      data: {
        id: sessionId,
        url: context.url,
        debugUrl: context.debugUrl,
        wsUrl: context.wsUrl,
        active: true,
      },
    });

    // Create initial thread for session creation
    const initialThread = await prisma.thread.create({
      data: {
        sessionId,
        type: 'log',
        content: `Session created with overlay ${injectOverlay ? 'enabled' : 'disabled'}`,
        metadata: {
          debugUrl: context.debugUrl,
          wsUrl: context.wsUrl,
        },
      },
    });
    
    // Broadcast thread creation via WebSocket
    wsService.sendThreadUpdate(sessionId, initialThread);
    
    console.log(`✅ Session created successfully`);
    console.log(`   - Session ID: ${sessionId}`);
    console.log(`   - Debug URL: ${context.debugUrl}`);
    // Update session in database
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        active: false,
        closedAt: new Date(),
      },
    });

    // Create thread for session closure
    await prisma.thread.create({
      data: {
        sessionId,
        type: 'log',
        content: 'Session closed by user',
      },
    });
    
    console.log(`   - Page URL: ${context.url}`);
    console.log(`   - Overlay: ${injectOverlay ? 'Enabled' : 'Disabled'}`);
    console.log(`   - Database: Session and initial thread saved`);
    
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

    // Create thread for command
    if (sessionId) {
      const commandThread = await prisma.thread.create({
        data: {
          sessionId,
          type: 'command',
          content: command,
          metadata: {
            url,
            useContext,
          },
        },
      });
      
      // Broadcast thread creation via WebSocket
      wsService.sendThreadUpdate(sessionId, commandThread);
    }

    const payload = await runNaturalLanguageCommand({
      command,
      url,
      sessionId,
      useContext,
    });

    // Create thread for response
    if (sessionId) {
      const responseThread = await prisma.thread.create({
        data: {
          sessionId,
          type: 'response',
          content: JSON.stringify(payload),
          metadata: {
            success: true,
          },
        },
      });
      
      // Broadcast thread creation via WebSocket
      wsService.sendThreadUpdate(sessionId, responseThread);
    }

    res.json({
      ...payload,
      sessionId,
      success: true,
    });
  } catch (error) {
    console.error('❌ Command execution error:', (error as Error).message);
    console.error((error as Error).stack);

    // Create thread for error
    if (req.body.sessionId) {
      try {
        await prisma.thread.create({
          data: {
            sessionId: req.body.sessionId,
            type: 'response',
            content: (error as Error).message,
            metadata: {
              success: false,
              error: true,
            },
          },
        });
      } catch (dbError) {
        console.error('Failed to save error thread:', dbError);
      }
    }

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

// Get all threads for a session
commandRouter.get('/session/:sessionId/threads', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const threads = await prisma.thread.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
    
    res.json({
      threads,
      success: true,
    });
  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({
      error: 'Failed to get threads',
      message: (error as Error).message,
    });
  }
});
