import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { login, register } from '../services/api';

const Auth = ({ setUserId }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            let data;
            if (isLogin) {
                data = await login(identifier, password);
                setSuccess('Login successful! Redirecting...');
            } else {
                data = await register(identifier, password);
                setSuccess('Account created successfully! Redirecting...');
            }
            
            const newUserId = data.userId;
            const newToken = data.token;
            localStorage.setItem('soulscript_userId', newUserId);
            if (newToken) {
                localStorage.setItem('soulscript_token', newToken);
            }
            
            setTimeout(() => {
                setUserId(newUserId);
                navigate(-1); // Go back to the page they were on
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="home-container">
            <motion.div 
                className="verse-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ maxWidth: '400px', width: '100%', margin: '4rem auto', padding: '2rem' }}
            >
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--accent)', fontFamily: 'var(--font-serif)' }}>
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                
                {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>{error}</div>}
                
                {success && <div style={{ color: '#10b981', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem', padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px' }}>{success}</div>}
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>Email or Mobile</label>
                        <input 
                            type="text" 
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                            style={{ 
                                width: '100%', padding: '0.75rem', borderRadius: '8px', 
                                border: '1px solid var(--text-muted)', background: 'var(--secondary-bg)', color: 'var(--text-main)'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ 
                                width: '100%', padding: '0.75rem', borderRadius: '8px', 
                                border: '1px solid var(--text-muted)', background: 'var(--secondary-bg)', color: 'var(--text-main)'
                            }}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            background: 'var(--accent)',
                            color: 'white',
                            border: 'none',
                            padding: '1rem',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginTop: '0.5rem',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                    </button>
                </form>
                
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', opacity: 0.8 }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: '600', cursor: 'pointer' }}
                    >
                        {isLogin ? 'Sign up' : 'Login'}
                    </button>
                </p>
            </motion.div>
        </div>
    );
};

export default Auth;
