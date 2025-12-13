export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface WebSession {
  id: string;
  url: string;
  messages: Message[];
  createdAt: Date;
}
