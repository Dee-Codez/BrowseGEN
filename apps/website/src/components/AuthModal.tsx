import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const endpoint = isLogin ? 'http://localhost:3001/api/auth/login' : 'http://localhost:3001/api/auth/signup';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            // Mock token for now (ID) implies session
            login(data.user.id, data.user);
            onClose();
        } catch (err) {
            setError((err as Error).message);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                background: '#111', padding: '32px', borderRadius: '16px',
                border: '1px solid #333', width: '100%', maxWidth: '400px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}>
                <h2 style={{ fontSize: '24px', marginBottom: '24px', color: 'white' }}>
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>

                {error && (
                    <div style={{ padding: '8px', background: 'rgba(255, 59, 48, 0.1)', color: '#ff3b30', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '14px' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%', padding: '12px', background: '#222',
                                border: '1px solid #333', borderRadius: '8px', color: 'white', outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '14px' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%', padding: '12px', background: '#222',
                                border: '1px solid #333', borderRadius: '8px', color: 'white', outline: 'none'
                            }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '16px' }}>
                        {isLogin ? 'Log In' : 'Sign Up'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', fontSize: '14px', color: '#888' }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 500 }}
                    >
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </div>

                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '24px' }}
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

export default AuthModal;
