declare module 'puter' {
  interface PuterAIMessage {
    content: string;
    role?: string;
  }

  interface PuterAIResponse {
    message?: PuterAIMessage;
    error?: string;
  }

  interface PuterAIChatOptions {
    model?: string;
    temperature?: number;
    stream?: boolean;
  }

  interface PuterAI {
    chat(prompt: string, options?: PuterAIChatOptions): Promise<PuterAIResponse>;
    txt2img(prompt: string, options?: any): Promise<any>;
  }

  interface Puter {
    ai: PuterAI;
  }

  const puter: Puter;
  export default puter;
}
