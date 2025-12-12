import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CommandInterpretation {
  action: 'click' | 'fill' | 'navigate' | 'extract' | 'scroll' | 'wait' | 'screenshot' | 'select' | 'hover' | 'press' | 'unknown';
  target?: string;
  value?: string;
  selector?: string;
  executable: boolean;
  confidence: number;
  steps?: CommandInterpretation[];
  elementDescription?: string;
  reasoning?: string;
}

export interface PageContext {
  url: string;
  title?: string;
  availableElements?: ElementInfo[];
}

export interface ElementInfo {
  type: string;
  text?: string;
  placeholder?: string;
  ariaLabel?: string;
  id?: string;
  className?: string;
}

export async function processCommand(
  command: string,
  url: string,
  context?: PageContext
): Promise<CommandInterpretation> {
  try {
    const contextInfo = context ? `
Current Page Title: "${context.title}"
Available Interactive Elements: ${JSON.stringify(context.availableElements?.slice(0, 20))}` : '';

    const prompt = `
You are an expert web automation assistant. Interpret natural language commands into precise automation actions.

Command: "${command}"
Current URL: "${url}"${contextInfo}

Analyze the command and respond with a JSON object containing:
- action: one of [click, fill, navigate, extract, scroll, wait, screenshot, select, hover, press, unknown]
- target: description of the element to interact with
- value: any value to input (for fill, select actions) or key to press
- selector: CSS selector if inferrable (use text=, placeholder=, or aria-label= for text-based matching)
- elementDescription: detailed description of what element to find (e.g., "blue button with text Submit")
- executable: boolean indicating if this can be automated
- confidence: 0-1 score of interpretation confidence
- reasoning: brief explanation of your interpretation
- steps: array of sub-commands if this requires multiple steps (each with same structure)

Examples:
- "click login" → {action: "click", target: "login", selector: "text=login", executable: true, confidence: 0.9}
- "search for laptops" → {action: "fill", target: "search box", value: "laptops", selector: "[placeholder*=search], input[type=search]", executable: true, confidence: 0.85}
- "go to google.com" → {action: "navigate", value: "https://google.com", executable: true, confidence: 1.0}

Respond only with the JSON object, no additional text.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Free and fast model
      messages: [
        {
          role: 'system',
          content: 'You are a precise web automation assistant. Always respond with valid JSON only.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(content) as CommandInterpretation;
  } catch (error) {
    console.error('NLP processing error:', error);
    // Fallback to simple parsing
    return parseCommandFallback(command);
  }
}

function parseCommandFallback(command: string): CommandInterpretation {
  const lowerCommand = command.toLowerCase();

  if (lowerCommand.includes('click')) {
    return {
      action: 'click',
      target: extractTarget(command, 'click'),
      executable: true,
      confidence: 0.5,
    };
  } else if (lowerCommand.includes('fill') || lowerCommand.includes('type')) {
    return {
      action: 'fill',
      target: extractTarget(command, 'fill'),
      value: extractValue(command),
      executable: true,
      confidence: 0.5,
    };
  } else if (lowerCommand.includes('navigate') || lowerCommand.includes('go to')) {
    return {
      action: 'navigate',
      value: extractUrl(command),
      executable: true,
      confidence: 0.5,
    };
  } else {
    return {
      action: 'unknown',
      executable: false,
      confidence: 0,
    };
  }
}

function extractTarget(command: string, action: string): string {
  const parts = command.split(action);
  return parts[1]?.trim() || '';
}

function extractValue(command: string): string {
  const withMatch = command.match(/with\s+["']?([^"']+)["']?/i);
  return withMatch?.[1] || '';
}

function extractUrl(command: string): string {
  // First try to match full URL with protocol
  const fullUrlMatch = command.match(/https?:\/\/[^\s]+/);
  if (fullUrlMatch) return fullUrlMatch[0];
  
  // Try to extract domain after "go to", "navigate to", "visit", etc.
  const goToMatch = command.match(/(?:go to|navigate to|visit|open)\s+([\w.-]+(?:\.[\w.-]+)+(?:\/[^\s]*)?)/i);
  if (goToMatch) return goToMatch[1];
  
  // Try to match any domain-like pattern
  const domainMatch = command.match(/\b([\w-]+\.(?:com|org|net|edu|gov|io|co|ai|dev|app|xyz|tech)[^\s]*)\b/i);
  if (domainMatch) return domainMatch[1];
  
  return '';
}
