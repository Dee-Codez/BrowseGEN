import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { CommandInterpretation, PageContext, ElementInfo } from './nlp';
import { wsService } from './websocket';
import * as fs from 'fs';
import * as path from 'path';

let browser: Browser | null = null;
let debugPort = 9222;
const HTTP_PORT = parseInt(process.env.PORT || '3001', 10);
const SECURE_WS_PORT = parseInt(process.env.WS_SECURE_PORT || '3443', 10);
const activeSessions = new Map<string, { context: BrowserContext; page: Page; debugUrl?: string }>();

const overlayInjectionScript = (sessionId: string, wsPort: number, wssPort: number) => {
  const globalWindow = globalThis as any;
  const overlayId = 'browsegen-overlay';
  const normalizePort = (port: number) => (Number.isFinite(port) ? port : 3001);
  const wsPortResolved = normalizePort(wsPort);
  const wssPortResolved = normalizePort(wssPort);
  const wsUrl = `ws://localhost:${wsPortResolved}/ws`;
  const wssUrl = `wss://localhost:${wssPortResolved}/ws`;
  const prefersSecure = globalWindow.location?.protocol === 'https:';
  const primaryUrl = prefersSecure ? wssUrl : wsUrl;
  const fallbackUrl = prefersSecure ? wsUrl : wssUrl;

  const ensureBody = () => {
    const doc = globalWindow.document;
    if (!doc) return;
    if (!doc.body) {
      const body = doc.createElement('body');
      doc.documentElement.appendChild(body);
    }
  };

  const createOverlay = () => {
    const doc = globalWindow.document;
    if (!doc || doc.getElementById(overlayId)) {
      return;
    }
    ensureBody();
    const overlay = doc.createElement('div');
    overlay.id = overlayId;
    overlay.innerHTML = `
      <style>
        #browsegen-overlay {
          position: fixed;
          bottom: 32px;
          right: 32px;
          width: 360px;
          background: rgba(18, 18, 18, 0.92);
          color: #fff;
          border-radius: 18px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.45);
          backdrop-filter: blur(18px);
          z-index: 999999;
          border: 1px solid rgba(255,255,255,0.08);
          overflow: hidden;
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
        }
        #browsegen-overlay .browsegen-inner {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 22px;
        }
        #browsegen-overlay .browsegen-header {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        #browsegen-overlay .browsegen-title {
          font-weight: 700;
          font-size: 18px;
        }
        #browsegen-overlay .browsegen-subtitle {
          font-size: 12px;
          color: #a3a3a3;
        }
        #browsegen-input {
          width: 100%;
          padding: 12px 14px;
          font-size: 14px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.04);
          color: #fff;
        }
        #browsegen-input:focus {
          outline: none;
          border-color: #8efbd9;
          box-shadow: 0 0 0 2px rgba(142, 251, 217, 0.3);
        }
        #browsegen-submit {
          width: 100%;
          padding: 10px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #45f0b2, #1c9bdc);
          color: #071b2d;
          font-weight: 600;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        #browsegen-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        #browsegen-status, .browsegen-status {
          min-height: 24px;
          font-size: 13px;
          border-radius: 8px;
          padding: 6px 10px;
          background: rgba(255,255,255,0.08);
          color: #fff;
          transition: background 0.18s ease;
        }
        #browsegen-status.info { background: rgba(255,255,255,0.08); }
        #browsegen-status.success { background: #1a876b; }
        #browsegen-status.error { background: #d23f4d; }
        #browsegen-status.executing { background: #3258ff; }
      </style>
      <div class="browsegen-inner">
        <div class="browsegen-header">
          <span class="browsegen-title">BrowseGEN AI</span>
          <span class="browsegen-subtitle">Session ${sessionId.substring(0, 8)}...</span>
        </div>
        <input id="browsegen-input" type="text" placeholder="Type a command" autocomplete="off" />
        <button id="browsegen-submit">Submit</button>
        <div id="browsegen-status" class="browsegen-status info">Waiting for commands...</div>
      </div>
    `;
    doc.body.appendChild(overlay);
    const inputEl: any = overlay.querySelector('#browsegen-input');
    const buttonEl: any = overlay.querySelector('#browsegen-submit');
    const statusEl: any = overlay.querySelector('#browsegen-status');
    const setStatus = (text: string, type: 'info' | 'success' | 'error' | 'executing' = 'info') => {
      if (!statusEl) return;
      statusEl.textContent = text;
      statusEl.className = `browsegen-status ${type}`;
    };
    let ws: WebSocket | null = null;
    let reconnectHandle: number | null = null;

    const scheduleReconnect = () => {
      if (reconnectHandle !== null) return;
      reconnectHandle = globalWindow.setTimeout(() => {
        reconnectHandle = null;
        connectWebSocket();
      }, 2500);
    };

    let attemptingFallback = false;

    const connectWebSocket = (url: string = primaryUrl) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        return;
      }
      ws = new WebSocket(url);
      setStatus('Connecting to automation...', 'info');
      ws.addEventListener('open', () => {
        setStatus('Connected to automation', 'success');
        ws?.send(JSON.stringify({ type: 'subscribe', sessionId }));
      });
      ws.addEventListener('message', (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'log') {
            setStatus(payload.data?.message || 'Processing...', 'info');
          } else if (payload.type === 'error') {
            setStatus(payload.data?.error || 'Error executing command', 'error');
          } else if (payload.type === 'complete') {
            setStatus('Command completed', 'success');
          }
        } catch (error) {
          globalWindow.console.error('Overlay WS parse error:', error);
        }
      });
      ws.addEventListener('close', () => {
        attemptingFallback = false;
        setStatus('Disconnected. Reconnecting...', 'error');
        scheduleReconnect();
      });
      ws.addEventListener('error', () => {
        if (!attemptingFallback && fallbackUrl && fallbackUrl !== url) {
          attemptingFallback = true;
          setStatus('Switching connection protocol...', 'info');
          connectWebSocket(fallbackUrl);
          return;
        }
        setStatus('WebSocket error', 'error');
        ws?.close();
      });
    };

    const sendCommand = () => {
      if (!inputEl || !buttonEl || !statusEl) {
        return;
      }
      const text = inputEl.value.trim();
      if (!text) {
        setStatus('Please type a command', 'error');
        return;
      }
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        setStatus('WebSocket not connected', 'error');
        reconnectHandle === null && scheduleReconnect();
        return;
      }
      inputEl.value = '';
      setStatus(`Sending: ${text}`, 'executing');
      ws.send(JSON.stringify({ type: 'command', sessionId, command: text }));
    };

    buttonEl?.addEventListener('click', sendCommand);
    inputEl?.addEventListener('keydown', (event: any) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        sendCommand();
      }
    });
    inputEl?.focus();
    connectWebSocket();
  };

  const ensureOverlay = () => {
    ensureBody();
    createOverlay();
  };

  const readyState = globalWindow.document?.readyState;
  if (readyState === 'complete' || readyState === 'interactive') {
    ensureOverlay();
  } else {
    globalWindow.document?.addEventListener('DOMContentLoaded', ensureOverlay);
    globalWindow.addEventListener('load', ensureOverlay);
  }
};

async function injectOverlayNow(page: Page, sessionId: string, wsPort: number, wssPort: number): Promise<void> {
  console.log(`💉 injectOverlayNow called for session ${sessionId}`);
  try {
    await page.waitForSelector('body', { timeout: 3000 }).catch(() => {});
    await page.evaluate(overlayInjectionScript, sessionId, wsPort, wssPort);
    console.log('✅ Overlay injection ensured');
  } catch (error) {
    console.error('❌ Failed to inject overlay:', error);
  }
}

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({ 
      headless: false, // Always run in headed mode for streaming
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        `--remote-debugging-port=${debugPort}`,
        '--remote-allow-origins=*',
        '--ignore-certificate-errors',
        '--allow-insecure-localhost'
      ]
    });
  }
  return browser;
}

export async function createSession(sessionId: string, injectOverlay: boolean = false): Promise<PageContext & { debugUrl: string; wsUrl: string }> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();
  
  await page.goto('data:text/html,<!DOCTYPE html><html><head><title>BrowseGEN</title></head><body></body></html>');
  await page.setViewportSize({ width: 1280, height: 780 });
  await page.evaluate(() => {
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.minHeight = '100vh';
    document.body.style.margin = '0';
  });
  
  // Get CDP session for this page
  const cdpSession = await page.context().newCDPSession(page);
  const { targetInfo } = await cdpSession.send('Target.getTargetInfo') as any;
  
  const debugUrl = `http://localhost:${debugPort}`;
  const wsUrl = `ws://localhost:${debugPort}/devtools/page/${targetInfo.targetId}`;
  
  activeSessions.set(sessionId, { context, page, debugUrl });
  
  wsService.sendLog(sessionId, `Browser session created. Debug URL: ${debugUrl}`);
  
  console.log(`🎨 createSession called with injectOverlay=${injectOverlay}`);
  if (injectOverlay) {
    console.log('📋 Injecting overlay...');
    await page.addInitScript(overlayInjectionScript, sessionId, HTTP_PORT, SECURE_WS_PORT);
    console.log('🚀 Running immediate overlay injection...');
    await injectOverlayNow(page, sessionId, HTTP_PORT, SECURE_WS_PORT);
    console.log('✅ Overlay injected');
  }
  
  return {
    url: page.url(),
    title: await page.title(),
    debugUrl,
    wsUrl
  };
}

export async function getSession(sessionId: string): Promise<{ context: BrowserContext; page: Page } | undefined> {
  return activeSessions.get(sessionId);
}

export async function closeSession(sessionId: string): Promise<void> {
  const session = activeSessions.get(sessionId);
  if (session) {
    await session.context.close();
    activeSessions.delete(sessionId);
  }
}

export async function executeCommand(
  interpretation: CommandInterpretation,
  sessionId?: string
): Promise<any> {
  let session = sessionId ? activeSessions.get(sessionId) : null;
  let shouldCloseContext = false;

  if (!session) {
    const browser = await getBrowser();
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    session = { context, page };
    shouldCloseContext = true;
  }

  const { page } = session;

  try {
    let result: any = {};

    if (sessionId) {
      wsService.sendLog(sessionId, `Executing command: ${interpretation.action}`);
    }

    // Execute multi-step commands
    if (interpretation.steps && interpretation.steps.length > 0) {
      const stepResults = [];
      for (const step of interpretation.steps) {
        if (sessionId) {
          wsService.sendAction(sessionId, step.action, { target: step.target, value: step.value });
        }
        const stepResult = await executeSingleAction(page, step, sessionId);
        stepResults.push(stepResult);
        await page.waitForTimeout(500);
      }
      result = { action: 'multi-step', steps: stepResults, success: true };
    } else {
      result = await executeSingleAction(page, interpretation, sessionId);
    }

    if (sessionId) {
      wsService.sendComplete(sessionId, result);
    }

    if (shouldCloseContext) {
      await session.context.close();
    }
    
    return result;
  } catch (error) {
    if (sessionId) {
      wsService.sendError(sessionId, (error as Error).message);
    }
    if (shouldCloseContext && session) {
      await session.context.close();
    }
    throw error;
  }
}

async function executeSingleAction(page: Page, interpretation: CommandInterpretation, sessionId?: string): Promise<any> {
  // Highlight element before action
  if (sessionId && interpretation.selector) {
    await highlightElement(page, interpretation.selector, sessionId);
  }
  
  // Special handling for 'search' intent (natural language: 'search for ...')
  if (interpretation.action === 'fill' && (interpretation.target?.toLowerCase().includes('search') || interpretation.selector?.includes('search'))) {
    // Try robust search selectors
    const searchSelectors = [
      '[placeholder*=search i]',
      'input[type=search]',
      'input[aria-label*=search i]',
      'input[name=q]',
      'input[role=searchbox]',
      'input',
      'textarea'
    ];
    let found = false;
    let lastError = null;
    for (const selector of searchSelectors) {
      try {
        await page.fill(selector, interpretation.value ?? '', { timeout: 20000 });
        if (sessionId) await highlightElement(page, selector, sessionId);
        found = true;
        break;
      } catch (e) {
        lastError = e;
      }
    }
    if (!found) {
      // Optionally, take a screenshot for debugging
      try { await page.screenshot({ path: `search_not_found_${Date.now()}.png` }); } catch {}
      throw new Error('Could not find a search box on the page. Tried selectors: ' + searchSelectors.join(', ') + (lastError ? `\nLast error: ${lastError}` : ''));
    }
    // Try to submit the form or press Enter
    let pressed = false;
    for (const selector of ['input[type=search]', 'input', 'textarea']) {
      try {
        await page.press(selector, 'Enter', { timeout: 4000 });
        pressed = true;
        break;
      } catch (e) {}
    }
    return { success: true, message: `Searched for '${interpretation.value}'` };
  }
  // Default action handling
  switch (interpretation.action) {
    case 'click':
      return await handleClick(page, interpretation, sessionId);
    case 'fill':
      return await handleFill(page, interpretation, sessionId);
    case 'navigate':
      return await handleNavigate(page, interpretation, sessionId);
    case 'extract':
      return await handleExtract(page, interpretation, sessionId);
    case 'scroll':
      return await handleScroll(page, interpretation, sessionId);
    case 'screenshot':
      return await handleScreenshot(page, interpretation, sessionId);
    case 'select':
      return await handleSelect(page, interpretation, sessionId);
    case 'hover':
      return await handleHover(page, interpretation, sessionId);
    case 'press':
      return await handlePress(page, interpretation, sessionId);
    case 'wait':
      return await handleWait(page, interpretation, sessionId);
    default:
      return { error: 'Action not supported', action: interpretation.action };
  }
}

// Helper function to highlight elements before interacting
async function highlightElement(page: Page, selector: string, sessionId?: string): Promise<void> {
  try {
    // @ts-ignore - browser context has access to document and DOM
    await page.evaluate((sel) => {
      const elements = document.querySelectorAll(sel);
      elements.forEach((el: Element) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.outline = '3px solid #ff6b6b';
        htmlEl.style.outlineOffset = '2px';
        htmlEl.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
      });
    }, selector);
    
    await page.waitForTimeout(800); // Show highlight briefly
    
    // Remove highlight
    // @ts-ignore - browser context has access to document and DOM
    await page.evaluate((sel) => {
      const elements = document.querySelectorAll(sel);
      elements.forEach((el: Element) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.outline = '';
        htmlEl.style.outlineOffset = '';
        htmlEl.style.backgroundColor = '';
      });
    }, selector);
  } catch (error) {
    // Highlight failed, continue anyway
    console.log('Highlight failed:', error);
  }
}

async function handleClick(page: Page, interpretation: CommandInterpretation, sessionId?: string): Promise<any> {
  let selector = interpretation.selector;
  
  if (!selector && interpretation.target) {
    // Smart element detection by trying multiple strategies
    const strategies = [
      `text=${interpretation.target}`,
      `button:has-text("${interpretation.target}")`,
      `a:has-text("${interpretation.target}")`,
      `[aria-label*="${interpretation.target}" i]`,
      `[title*="${interpretation.target}" i]`,
      `input[value*="${interpretation.target}" i]`,
    ];
    
    for (const strategy of strategies) {
      try {
        const element = await page.locator(strategy).first();
        if (await element.count() > 0) {
          selector = strategy;
          break;
        }
      } catch (e) {
        continue;
      }
    }
  }
  
  if (!selector) {
    throw new Error(`Could not find clickable element for: ${interpretation.target}`);
  }
  
  await page.click(selector, { timeout: 10000 });
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  
  return { 
    action: 'click', 
    target: interpretation.target,
    selector,
    success: true 
  };
}

async function handleFill(page: Page, interpretation: CommandInterpretation, sessionId?: string): Promise<any> {
  if (!interpretation.value) {
    throw new Error('Missing value for fill action');
  }
  
  let selector = interpretation.selector;
  
  if (!selector && interpretation.target) {
    // Smart field detection
    const target = interpretation.target.toLowerCase();
    const strategies = [
      `input[placeholder*="${interpretation.target}" i]`,
      `input[name*="${target}"]`,
      `input[id*="${target}"]`,
      `textarea[placeholder*="${interpretation.target}" i]`,
      `[aria-label*="${interpretation.target}" i]`,
      'input[type="text"]',
      'input[type="search"]',
      'textarea',
    ];
    
    for (const strategy of strategies) {
      try {
        const element = await page.locator(strategy).first();
        if (await element.count() > 0) {
          selector = strategy;
          break;
        }
      } catch (e) {
        continue;
      }
    }
  }
  
  if (!selector) {
    throw new Error(`Could not find fillable field for: ${interpretation.target}`);
  }
  
  await page.fill(selector, interpretation.value, { timeout: 20000 });
  
  return { 
    action: 'fill', 
    target: interpretation.target,
    value: interpretation.value,
    selector,
    success: true 
  };
}

async function handleNavigate(page: Page, interpretation: CommandInterpretation, sessionId?: string): Promise<any> {
  if (!interpretation.value) {
    throw new Error('Missing URL for navigation');
  }
  
  // Add https:// if no protocol specified
  let url = interpretation.value;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  if (sessionId) {
    wsService.sendLog(sessionId, `Navigating to ${url}`);
  }
  
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  
  return { action: 'navigate', url, success: true };
}

async function handleExtract(page: Page, interpretation: CommandInterpretation, sessionId?: string): Promise<any> {
  if (!interpretation.selector) {
    throw new Error('Missing selector for extraction');
  }
  const elements = await page.$$(interpretation.selector);
  const data = await Promise.all(
    elements.map(async (el) => await el.textContent())
  );
  return { action: 'extract', data, count: data.length };
}

async function handleScroll(page: Page, interpretation: CommandInterpretation, sessionId?: string): Promise<any> {
  const direction = interpretation.value || 'down';
  
  // @ts-ignore - window and document are available in browser context
  await page.evaluate((dir) => {
    if (dir === 'down' || dir === 'bottom') {
      window.scrollTo(0, document.body.scrollHeight);
    } else if (dir === 'up' || dir === 'top') {
      window.scrollTo(0, 0);
    } else if (dir === 'page') {
      window.scrollBy(0, window.innerHeight);
    }
  }, direction);
  
  return { action: 'scroll', direction, success: true };
}

async function handleScreenshot(page: Page, interpretation: CommandInterpretation, sessionId?: string): Promise<any> {
  const screenshotDir = path.join(process.cwd(), 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  const filename = `screenshot-${Date.now()}.png`;
  const filepath = path.join(screenshotDir, filename);
  
  await page.screenshot({ path: filepath, fullPage: interpretation.value === 'full' });
  
  return { 
    action: 'screenshot', 
    path: filepath,
    filename,
    success: true 
  };
}

async function handleSelect(page: Page, interpretation: CommandInterpretation, sessionId?: string): Promise<any> {
  if (!interpretation.selector || !interpretation.value) {
    throw new Error('Missing selector or value for select action');
  }
  
  await page.selectOption(interpretation.selector, interpretation.value);
  
  return { 
    action: 'select',
    selector: interpretation.selector,
    value: interpretation.value,
    success: true 
  };
}

async function handleHover(page: Page, interpretation: CommandInterpretation, sessionId?: string): Promise<any> {
  if (!interpretation.selector && !interpretation.target) {
    throw new Error('Missing selector or target for hover action');
  }
  
  const selector = interpretation.selector || `text=${interpretation.target}`;
  await page.hover(selector);
  
  return { 
    action: 'hover',
    selector,
    success: true 
  };
}

async function handlePress(page: Page, interpretation: CommandInterpretation, sessionId?: string): Promise<any> {
  const key = interpretation.value || 'Enter';
  await page.keyboard.press(key);
  
  return { 
    action: 'press',
    key,
    success: true 
  };
}

async function handleWait(page: Page, interpretation: CommandInterpretation, sessionId?: string): Promise<any> {
  const duration = parseInt(interpretation.value || '1000');
  await page.waitForTimeout(duration);
  
  return { 
    action: 'wait',
    duration,
    success: true 
  };
}

export async function getPageContext(sessionId?: string): Promise<PageContext> {
  const session = sessionId ? activeSessions.get(sessionId) : null;
  
  if (!session) {
    throw new Error('No active session found');
  }
  
  const { page } = session;
  
  const context: PageContext = {
    url: page.url(),
    title: await page.title(),
    // @ts-ignore - browser context has access to document and DOM
    availableElements: await page.evaluate(() => {
      const elements: any[] = [];
      
      // Get all interactive elements
      const interactiveSelectors = [
        'button', 'a', 'input', 'textarea', 'select',
        '[role="button"]', '[onclick]', '[role="link"]'
      ];
      
      interactiveSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach((el: any) => {
          const element = el as HTMLElement;
          elements.push({
            type: element.tagName.toLowerCase(),
            text: element.textContent?.trim().substring(0, 50),
            placeholder: element.getAttribute('placeholder') || undefined,
            ariaLabel: element.getAttribute('aria-label') || undefined,
            id: element.id || undefined,
            className: element.className || undefined,
          });
        });
      });
      
      return elements.slice(0, 50); // Limit to first 50 elements
    }),
  };
  
  return context;
}

// Cleanup on process exit
process.on('exit', async () => {
  if (browser) {
    await browser.close();
  }
});

process.on('SIGINT', async () => {
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});
