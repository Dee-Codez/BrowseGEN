export interface CommandRequest {
  command: string;
  url?: string;
  context?: Record<string, any>;
}

export interface CommandResponse {
  interpretation: CommandInterpretation;
  result?: any;
  success: boolean;
  error?: string;
}

export interface CommandInterpretation {
  action: ActionType;
  target?: string;
  value?: string;
  selector?: string;
  executable: boolean;
  confidence: number;
}

export type ActionType = 
  | 'click'
  | 'fill'
  | 'navigate'
  | 'extract'
  | 'scroll'
  | 'wait'
  | 'unknown';

export interface MetricsSummary {
  totalCommands: number;
  successfulCommands: number;
  successRate: number;
  recentCommands: number;
  topWebsites: Array<{
    url: string;
    count: number;
  }>;
}

export interface CommandHistory {
  id: string;
  command: string;
  url?: string;
  success: boolean;
  error?: string;
  timestamp: Date;
}
