import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, Sparkles, Search, Zap, FileText, Globe, BarChart2 } from 'lucide-react';
import '../styles/auth.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);



    const { login, isAuthenticated, warmup } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/app');
        }
    }, [isAuthenticated, navigate]);

    // Pre-emptive warmup on mount
    useEffect(() => {
        warmup();
    }, [warmup]);



    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);

            if (result.success) {
                const destination = location.state?.from?.pathname || '/app';
                navigate(destination);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const suiteModules = [
        { name: 'Visibility', icon: <Search size={14} />, color: 'var(--accent-primary)' },
        { name: 'Optimizer', icon: <Zap size={14} />, color: 'var(--accent-secondary)' },
        { name: 'Simulator', icon: <FileText size={14} />, color: 'var(--success)' },
        { name: 'Citation', icon: <Globe size={14} />, color: 'var(--warning)' },
        { name: 'Analysis', icon: <BarChart2 size={14} />, color: 'var(--accent-primary)' }
    ];

    return (
        <div className="auth-container">
            {/* Aurora Background Component */}
            <div className="aurora-container">
                <div className="aurora-blob aurora-blob-1"></div>
                <div className="aurora-blob aurora-blob-2"></div>
                <div className="aurora-blob aurora-blob-3"></div>
            </div>

            {/* Top Atmospheric Half-Circles (Secondary Layer) */}
            <div className="half-circle" style={{
                background: 'radial-gradient(ellipse at center, var(--accent-primary), transparent 70%)',
                width: '100vw',
                opacity: 0.1,
                display: 'none' // Unified into aurora sweep
            }}></div>

            {/* Organic Background Shapes */}
            <div className="organic-shape shape-1" style={{
                top: '-5%',
                left: '-5%',
                animationDelay: '0s'
            }}></div>
            <div className="organic-shape shape-2" style={{
                bottom: '0%',
                right: '-5%',
                animationDelay: '-5s'
            }}></div>
            <div className="organic-shape shape-3" style={{
                top: '25%',
                right: '10%',
                opacity: 0.1,
                animationDelay: '-10s'
            }}></div>
            <div className="organic-shape shape-1" style={{
                bottom: '10%',
                left: '10%',
                width: '30vw',
                height: '30vw',
                opacity: 0.05,
                animationDelay: '-15s',
                filter: 'blur(120px)'
            }}></div>

            <div className="auth-card animate-fade-in">
                <div className="auth-header">
                    <div className="auth-logo">
                        <img
                            src="/no_bg_logo.png"
                            alt="Logo"
                            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'contain', marginBottom: '0.5rem' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <Sparkles size={18} color="var(--accent-primary)" />
                            <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Good to see you again</h1>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="auth-error">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Your email</label>
                        <div className="input-wrapper">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e.g. name@company.com"
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Your password</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="password-toggle"
                                style={{
                                    position: 'absolute',
                                    right: '1.25rem',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-tertiary)',
                                    cursor: 'pointer',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                        style={{ marginTop: '0.5rem' }}
                    >
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div className="loading-spinner"></div>
                                <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                                    Signing in...
                                </span>
                            </div>
                        ) : (
                            <>
                                <span>Sign In to Dashboard</span>
                            </>
                        )}
                    </button>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '1.5rem',
                        fontSize: '0.85rem'
                    }}>
                        <Link to="/register" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: '600' }}>
                            Don't have an account?
                        </Link>
                        <Link to="#" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: '600' }}>
                            Forgot password?
                        </Link>
                    </div>
                </form>
            </div>

            {/* Suite Footer */}
            <div className="suite-footer animate-fade-in" style={{ animationDelay: '0.4s' }}>
                {suiteModules.map((module, idx) => (
                    <div key={idx} className="suite-item">
                        <i style={{ background: module.color }}></i>
                        {module.name}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Login;
