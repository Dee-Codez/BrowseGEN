import { CommandInterpretation, PageContext, processCommand } from './nlp';
import { executeCommand, getPageContext } from './automation';
import { logMetric } from './metrics';

const shouldLogMetrics = process.env.DISABLE_METRIC_LOGGING !== 'true';
const shouldLogErrorMetrics = process.env.LOG_ERROR_METRICS === 'true';

export interface RunCommandOptions {
  command: string;
  url?: string;
  sessionId?: string;
  useContext?: boolean;
}

export interface RunCommandResult {
  interpretation: CommandInterpretation;
  result?: any;
  success: boolean;
  context?: PageContext;
}

export async function runNaturalLanguageCommand(options: RunCommandOptions): Promise<RunCommandResult> {
  const { command, url, sessionId, useContext = false } = options;
  let context: PageContext | undefined;

  try {
    if (useContext && sessionId) {
      try {
        context = await getPageContext(sessionId);
      } catch (error) {
        console.warn('Could not retrieve page context:', error);
      }
    }

    const interpretation = await processCommand(command, url || '', context);
    let result;
    if (interpretation.executable) {
      result = await executeCommand(interpretation, sessionId);
    }

    if (shouldLogMetrics) {
      await logMetric({
        command,
        url,
        sessionId,
        interpretation,
        success: true,
        timestamp: new Date(),
      });
    }

    return { interpretation, result, success: true, context };
  } catch (error: any) {
    if (shouldLogMetrics && shouldLogErrorMetrics) {
      await logMetric({
        command,
        url,
        sessionId,
        success: false,
        error: error.message,
        timestamp: new Date(),
      });
    }
    throw error;
  }
}
