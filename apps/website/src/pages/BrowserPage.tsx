import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthModal from '../components/AuthModal';

const BrowserPage = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [history, setHistory] = useState<any[]>([]);
    const [currentUrl, setCurrentUrl] = useState<string | null>(null);
    const hasProcessedCommand = React.useRef(false);

    const location = useLocation();
    const navigate = useNavigate();

    // Handle initial command from Landing Page
    useEffect(() => {
        if (location.state?.command && !hasProcessedCommand.current) {
            hasProcessedCommand.current = true;
            const initialCommand = location.state.command;
            // Don't setInput(initialCommand) so it stays clear
            window.history.replaceState({}, document.title);
            processCommand(initialCommand);
        }
    }, []);

    // Fetch history on mount if authenticated
    React.useEffect(() => {
        if (isAuthenticated && user?.id) {
            fetch(`http://localhost:3001/api/commands/history?userId=${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.history) setHistory(data.history);
                })
                .catch(err => console.error('Failed to fetch history', err));
        }
    }, [isAuthenticated, user?.id]);

    const handleProfileClick = () => {
        if (isAuthenticated) {
            setShowProfileMenu(!showProfileMenu);
        } else {
            setShowAuthModal(true);
        }
    };

    const processCommand = async (cmd: string) => {
        if (!cmd.trim()) return;

        setMessages(prev => [...prev, { text: cmd, isUser: true }]);

        // Optimistically add to history if logged in
        if (isAuthenticated) {
            setHistory(prev => [{ command: cmd, id: 'temp-' + Date.now() }, ...prev]);
        }

        // Keep input cleared if called from form, but if called programmatically we might want to ensure it matches
        if (input === cmd) setInput('');

        try {
            const res = await fetch('http://localhost:3001/api/commands', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    command: cmd,
                    userId: user?.id,
                    url: 'https://example.com'
                })
            });
            const data = await res.json();

            if (data.success && data.interpretation) {
                setMessages(prev => [...prev, {
                    text: `Interpreted: ${data.interpretation.action} ${data.interpretation.target || ''}`,
                    isUser: false
                }]);

                // If interpretation is navigation, verify URL
                // For now, simple mock: if command has 'go to' or 'flipkart', set mock URL
                if (cmd.toLowerCase().includes('go to') || cmd.toLowerCase().includes('search')) {
                    // In a real app, we'd get the actual URL from the backend/NLP
                    // Using Wikipedia as a safe frameable fallback for demo purposes
                    // Flipkart blocks iframes (X-Frame-Options), so we use a proxy or compatible site for demo
                    setCurrentUrl('https://www.wikipedia.org');
                }

            } else {
                setMessages(prev => [...prev, { text: `I would initiate navigation to: ${cmd}`, isUser: false }]);
                // Fallback demo
                if (cmd.toLowerCase().includes('go to')) {
                    setCurrentUrl('https://www.wikipedia.org');
                }
            }

            if (isAuthenticated && user?.id) {
                fetch(`http://localhost:3001/api/commands/history?userId=${user.id}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.history) setHistory(data.history);
                    });
            }

        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { text: `Error processing command.`, isUser: false }]);
        }
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        processCommand(input);
        setInput('');
    };

    return (
        <div className="browser-container" style={{
            display: 'flex',
            flexDirection: 'row', // Changed to row for sidebar
            height: '100vh',
            background: 'var(--bg-color)',
            color: 'var(--text-primary)',
            fontFamily: "'Outfit', sans-serif",
            overflow: 'hidden'
        }}>

            {/* Sidebar */}
            <div style={{
                width: showSidebar ? '280px' : '0px',
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--glass-border)',
                transition: 'width 0.3s ease',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0
            }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>History</span>
                    <button onClick={() => setShowSidebar(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>✕</button>
                </div>

                {/* Back Link */}
                <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--glass-border)' }}>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }} style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>←</span> Back to Home
                    </a>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                    {isAuthenticated ? (
                        history.length > 0 ? (
                            history.map((item: any, i) => (
                                <div key={i}
                                    onClick={() => setInput(item.command)}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        marginBottom: '8px',
                                        background: 'rgba(255,255,255,0.02)',
                                        fontSize: '14px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        color: 'var(--text-secondary)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                >
                                    {item.command}
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5, fontSize: '14px' }}>No history yet</div>
                        )
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5, fontSize: '14px' }}>Login to see history</div>
                    )}
                </div>
            </div>

            {/* Main Content Column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div className="bg-glow" style={{ opacity: 0.5 }}></div>
                {/* Header */}
                <header style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--glass-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(3, 0, 20, 0.6)',
                    backdropFilter: 'blur(12px)',
                    position: 'relative',
                    zIndex: 10
                }}>
                    <div style={{ fontWeight: 700, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {!showSidebar && (
                            <button
                                onClick={() => setShowSidebar(true)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary)',
                                    width: '32px',
                                    height: '32px',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                ☰
                            </button>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '24px', height: '24px', background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-purple))', borderRadius: '6px' }}></div>
                            WebGen Browser
                        </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <div
                            onClick={handleProfileClick}
                            style={{
                                cursor: 'pointer',
                                padding: '8px',
                                background: isAuthenticated ? 'linear-gradient(135deg, var(--bg-secondary), #1e293b)' : 'rgba(255,255,255,0.05)',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid var(--glass-border)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {isAuthenticated ? (user?.name?.[0]?.toUpperCase() || 'U') : '👤'}
                        </div>

                        {/* Profile Menu */}
                        {showProfileMenu && (
                            <div style={{
                                position: 'absolute',
                                top: '50px',
                                right: '0',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '12px',
                                padding: '8px',
                                minWidth: '150px',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                                zIndex: 100
                            }}>
                                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--glass-border)', marginBottom: '4px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                                    {user?.email}
                                </div>
                                <button
                                    onClick={logout}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#ff3b30',
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        borderRadius: '6px'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Main Area */}
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', zIndex: 1 }}>

                    {/* Website Overlay (Iframe) */}
                    {currentUrl && (
                        <iframe
                            src={currentUrl}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                zIndex: 0,
                                background: 'white' // iframe usually needs white bg
                            }}
                            title="Browser View"
                        />
                    )}

                    {/* Chat Overlay */}
                    <div style={{
                        position: 'relative',
                        zIndex: 10,
                        width: '100%',
                        maxWidth: '800px',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        pointerEvents: 'none' // Let clicks pass through to iframe where not clicking messages
                    }}>
                        {messages.length === 0 && !currentUrl ? (
                            <div style={{ textAlign: 'center', maxWidth: '600px', color: 'var(--text-secondary)', margin: 'auto', pointerEvents: 'auto' }}>
                                {/* Simplified Blank State */}
                                <div style={{ fontSize: '64px', opacity: 0.1, marginBottom: '24px' }}>🌐</div>
                                <h2 style={{ fontSize: '24px', fontWeight: 500, color: 'var(--text-primary)' }}>WebGen Browser</h2>
                                <p>Type a command below to start browsing.</p>
                                {!isAuthenticated && (
                                    <p style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}>
                                        Tip: Log in to save your session history.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="messages" style={{ width: '100%', flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
                                {messages.map((msg, i) => (
                                    <div key={i} style={{
                                        padding: '16px',
                                        margin: '16px 0',
                                        background: msg.isUser ? 'rgba(0,0,0,0.6)' : 'rgba(30, 41, 59, 0.8)', // Darker background for visibility over iframe
                                        backdropFilter: 'blur(8px)',
                                        borderRadius: '16px',
                                        border: '1px solid var(--glass-border)',
                                        display: 'flex',
                                        gap: '16px',
                                        pointerEvents: 'auto', // Enable clicking on messages
                                        maxWidth: '80%',
                                        marginLeft: msg.isUser ? 'auto' : '0'
                                    }}>
                                        <div style={{
                                            width: '32px', height: '32px',
                                            borderRadius: '10px',
                                            background: msg.isUser ? 'var(--bg-secondary)' : 'linear-gradient(135deg, var(--accent-pink), var(--accent-purple))',
                                            flexShrink: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                                            border: '1px solid var(--glass-border)'
                                        }}>
                                            {msg.isUser ? '👤' : '🤖'}
                                        </div>
                                        <div style={{ lineHeight: '1.6', color: 'var(--text-primary)' }}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>

                {/* Input Area */}
                <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', background: 'linear-gradient(to top, var(--bg-color), transparent)', position: 'relative', zIndex: 10 }}>
                    <form onSubmit={handleSend} style={{ width: '100%', maxWidth: '700px', position: 'relative' }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Start browsing..."
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--glass-border)',
                                padding: '16px 20px',
                                paddingRight: '48px',
                                borderRadius: '16px',
                                color: 'white',
                                fontSize: '16px',
                                outline: 'none',
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--accent-purple)';
                                e.target.style.background = 'rgba(255,255,255,0.05)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'var(--glass-border)';
                                e.target.style.background = 'rgba(255,255,255,0.03)';
                            }}
                        />
                        <button type="submit" style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: input.trim() ? 'var(--text-primary)' : 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: input.trim() ? 'black' : 'rgba(255,255,255,0.3)',
                            cursor: input.trim() ? 'pointer' : 'default',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s'
                        }} disabled={!input.trim()}>
                            ➤
                        </button>
                        <div style={{ position: 'absolute', bottom: '-24px', left: '0', right: '0', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
                            WebGen Intelligence can make mistakes. Consider checking important information.
                        </div>
                    </form>
                </div>

                {/* Auth Modal */}
                {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
            </div>
        </div>
    );
};

export default BrowserPage;
