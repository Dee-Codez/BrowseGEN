import { z } from 'zod';

export const commandRequestSchema = z.object({
  command: z.string().min(1, 'Command cannot be empty'),
  url: z.string().url().optional(),
  context: z.record(z.any()).optional(),
});

export const commandInterpretationSchema = z.object({
  action: z.enum(['click', 'fill', 'navigate', 'extract', 'scroll', 'wait', 'unknown']),
  target: z.string().optional(),
  value: z.string().optional(),
  selector: z.string().optional(),
  executable: z.boolean(),
  confidence: z.number().min(0).max(1),
});

export type CommandRequestInput = z.infer<typeof commandRequestSchema>;
export type CommandInterpretationInput = z.infer<typeof commandInterpretationSchema>;
