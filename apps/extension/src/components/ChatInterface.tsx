import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { executeActions } from '../utils/actionExecutor';

interface Message {
    id: string;
    type: 'user' | 'ai';
    text: string;
}

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', type: 'ai', text: 'Hi! I can help you navigate this site. Try "Search for shoes" or "Scroll down".' }
    ]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [mode, setMode] = useState<'guidance' | 'interaction'>('interaction'); // Default to interaction

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        console.log('WebGen ChatInterface v2.0 LOADED');
        setMessages(prev => [
            ...prev,
            {
                id: Date.now().toString(),
                type: 'ai',
                text: mode === 'guidance' ? "Guidance Mode: I will explain the page." : "Interaction Mode: I will perform actions."
            }
        ]);
    }, [mode]);

    const handleSend = async () => {
        if (!input.trim() || isProcessing) return;

        const newUserMsg: Message = { id: Date.now().toString(), type: 'user', text: input };
        setMessages(prev => [...prev, newUserMsg]);
        setInput('');
        setIsProcessing(true);

        const loadingMsgId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: loadingMsgId, type: 'ai', text: 'Thinking...' }]);

        try {
            if (mode === 'interaction') {
                // Send command to background script
                const response: any = await chrome.runtime.sendMessage({
                    type: 'EXECUTE_COMMAND',
                    command: newUserMsg.text,
                });

                if (response.error) {
                    throw new Error(response.error);
                }

                // Execute actions returned from backend directly
                if (response.actions && Array.isArray(response.actions)) {
                    console.log('ChatInterface: Executing actions client-side', response.actions);
                    executeActions(response.actions).catch((err: Error) => console.error('Action Execution Error:', err));

                    setMessages(prev => prev.map(msg =>
                        msg.id === loadingMsgId ? { ...msg, text: `Executed ${response.actions.length} actions.` } : msg
                    ));
                } else {
                    setMessages(prev => prev.map(msg =>
                        msg.id === loadingMsgId ? { ...msg, text: "I understood, but there were no actions to perform." } : msg
                    ));
                }

            } else {
                // Guidance mode (mock)
                setTimeout(() => {
                    setMessages(prev => prev.map(msg =>
                        msg.id === loadingMsgId ? { ...msg, text: "Here is what I found on the page..." } : msg
                    ));
                }, 1000);
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => prev.map(msg =>
                msg.id === loadingMsgId ? { ...msg, text: "Sorry, I encountered an error connecting to the brain." } : msg
            ));
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="content-area">
            <div className={`mode-switcher ${mode === 'interaction' ? 'mode-interaction' : ''}`}>
                <div className="mode-indicator" />
                <button
                    className={`mode-btn ${mode === 'guidance' ? 'active' : ''}`}
                    onClick={() => setMode('guidance')}
                >
                    Guidance
                </button>
                <button
                    className={`mode-btn ${mode === 'interaction' ? 'active' : ''}`}
                    onClick={() => setMode('interaction')}
                >
                    Interaction
                </button>
            </div>

            <div className="chat-box">
                {messages.map(msg => (
                    <div key={msg.id} className={`message ${msg.type}`}>
                        <strong>{msg.type === 'ai' ? 'AI:' : ''}</strong> {msg.text}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-container">
                <input
                    type="text"
                    className="chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask or command..."
                    disabled={isProcessing}
                />
                <button className="send-btn" onClick={handleSend} disabled={isProcessing}>
                    <Send className="send-icon" />
                </button>
            </div>
        </div>
    );
}
