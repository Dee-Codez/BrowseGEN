import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const [input, setInput] = useState('');
    const navigate = useNavigate();

    const handleStartChat = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        navigate('/browser', { state: { command: input } });
    };

    return (
        <>
            <div className="bg-glow"></div>

            <main className="container" style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '20px'
            }}>
                {/* Badge */}
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '50px',
                    marginBottom: '24px',
                    color: 'var(--accent-cyan)',
                    fontSize: '14px',
                    fontWeight: 500
                }}>
                    <span>✨</span> AI-Powered Web Interaction
                </div>

                {/* Hero Headings */}
                <h1 style={{ fontSize: '64px', fontWeight: 700, marginBottom: '16px', lineHeight: 1.1 }}>
                    Talk to <span className="text-gradient">any website</span>
                </h1>
                <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '40px', lineHeight: 1.6 }}>
                    Enter a URL and interact with any website using natural language.
                    Extract data, navigate pages, and get answers instantly.
                </p>

                {/* Input Area */}
                <form onSubmit={handleStartChat} style={{
                    display: 'flex',
                    gap: '12px',
                    width: '100%',
                    maxWidth: '600px',
                    position: 'relative'
                }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter any website URL or command..."
                        style={{
                            flex: 1,
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--glass-border)',
                            padding: '16px 24px',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '16px',
                            outline: 'none',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'var(--accent-cyan)';
                            e.target.style.background = 'rgba(255,255,255,0.05)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'var(--glass-border)';
                            e.target.style.background = 'rgba(255,255,255,0.03)';
                        }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0 32px', whiteSpace: 'nowrap' }}>
                        Start Chat →
                    </button>
                </form>

                {/* Footer Features */}
                <div style={{
                    display: 'flex',
                    gap: '24px',
                    marginTop: '48px',
                    color: 'var(--text-secondary)',
                    fontSize: '14px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--accent-cyan)' }}>🌐</span> Browse any website
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--accent-purple)' }}>💬</span> Natural language
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--accent-pink)' }}>⚡</span> Instant responses
                    </div>
                </div>
            </main>
        </>
    );
};

export default LandingPage;
