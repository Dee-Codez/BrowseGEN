import { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { MessageSquare, Minimize2, Cookie } from 'lucide-react';

function App() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const handleToggle = () => setIsCollapsed(prev => !prev);
        window.addEventListener('WEBGEN_TOGGLE_OVERLAY', handleToggle);
        return () => window.removeEventListener('WEBGEN_TOGGLE_OVERLAY', handleToggle);
    }, []);

    return (
        <div className={`overlay-container ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="header">
                <div className="logo-area">
                    <div className="logo-icon"><Cookie size={18} /></div>
                    <span>WebGen</span>
                </div>
                <button className="minimize-btn" onClick={() => setIsCollapsed(true)}>
                    <Minimize2 size={16} />
                </button>
            </div>

            <div className="floating-icon" onClick={() => setIsCollapsed(false)}>
                <MessageSquare size={24} />
            </div>

            <ChatInterface />
        </div>
    );
}

export default App;
