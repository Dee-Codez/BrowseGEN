import { chromium, Browser, Page } from 'playwright';
import { CommandInterpretation } from './nlp';

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
  }
  return browser;
}

export async function executeCommand(interpretation: CommandInterpretation): Promise<any> {
  const browser = await getBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    let result: any = {};

    switch (interpretation.action) {
      case 'click':
        result = await handleClick(page, interpretation);
        break;
      case 'fill':
        result = await handleFill(page, interpretation);
        break;
      case 'navigate':
        result = await handleNavigate(page, interpretation);
        break;
      case 'extract':
        result = await handleExtract(page, interpretation);
        break;
      case 'scroll':
        result = await handleScroll(page, interpretation);
        break;
      default:
        result = { error: 'Action not supported' };
    }

    await context.close();
    return result;
  } catch (error) {
    await context.close();
    throw error;
  }
}

async function handleClick(page: Page, interpretation: CommandInterpretation): Promise<any> {
  if (!interpretation.selector) {
    // Try to find element by text content
    const selector = `text=${interpretation.target}`;
    await page.click(selector);
  } else {
    await page.click(interpretation.selector);
  }
  return { action: 'click', success: true };
}

async function handleFill(page: Page, interpretation: CommandInterpretation): Promise<any> {
  if (!interpretation.selector || !interpretation.value) {
    throw new Error('Missing selector or value for fill action');
  }
  await page.fill(interpretation.selector, interpretation.value);
  return { action: 'fill', success: true };
}

async function handleNavigate(page: Page, interpretation: CommandInterpretation): Promise<any> {
  if (!interpretation.value) {
    throw new Error('Missing URL for navigation');
  }
  await page.goto(interpretation.value);
  return { action: 'navigate', url: interpretation.value, success: true };
}

async function handleExtract(page: Page, interpretation: CommandInterpretation): Promise<any> {
  if (!interpretation.selector) {
    throw new Error('Missing selector for extraction');
  }
  const elements = await page.$$(interpretation.selector);
  const data = await Promise.all(
    elements.map(async (el) => await el.textContent())
  );
  return { action: 'extract', data, count: data.length };
}

async function handleScroll(page: Page, interpretation: CommandInterpretation): Promise<any> {
  // This function runs in the browser context, so window and document are available
  await page.evaluate(() => {
    // @ts-ignore - window and document are available in browser context
    window.scrollTo(0, document.body.scrollHeight);
  });
  return { action: 'scroll', success: true };
}

// Cleanup on process exit
process.on('exit', async () => {
  if (browser) {
    await browser.close();
  }
});
