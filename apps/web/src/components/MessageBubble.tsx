import { motion } from "framer-motion";
import { Globe, Sparkles } from "lucide-react";

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
}

export const MessageBubble = ({ role, content, isLoading }: MessageBubbleProps) => {
  const isUser = role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
      )}
      
      <div
        className={`max-w-[80%] px-4 py-3 ${
          isUser ? 'chat-bubble-user' : 'chat-bubble-ai'
        }`}
      >
        {isLoading ? (
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        )}
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <Globe className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </motion.div>
  );
};
