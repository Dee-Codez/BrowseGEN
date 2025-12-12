import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CommandInterpretation {
  action: 'click' | 'fill' | 'navigate' | 'extract' | 'scroll' | 'wait' | 'unknown';
  target?: string;
  value?: string;
  selector?: string;
  executable: boolean;
  confidence: number;
}

export async function processCommand(
  command: string,
  url: string
): Promise<CommandInterpretation> {
  try {
    const prompt = `
You are a web automation assistant. Interpret the following natural language command into a structured action.

Command: "${command}"
Current URL: "${url}"

Analyze the command and respond with a JSON object containing:
- action: one of [click, fill, navigate, extract, scroll, wait, unknown]
- target: description of the element to interact with
- value: any value to input (for fill actions)
- selector: CSS selector if you can infer it
- executable: boolean indicating if this can be automated
- confidence: 0-1 score of interpretation confidence

Respond only with the JSON object, no additional text.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
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
  const urlMatch = command.match(/https?:\/\/[^\s]+/);
  return urlMatch?.[0] || '';
}
