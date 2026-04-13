import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, UserPlus, AlertCircle, Eye, EyeOff, Sparkles, Search, Zap, FileText, Globe, BarChart2 } from 'lucide-react';
import '../styles/auth.css';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    
    const suiteModules = [
        { name: 'Visibility', icon: <Search size={14} />, color: 'var(--accent-primary)' },
        { name: 'Optimizer', icon: <Zap size={14} />, color: 'var(--accent-secondary)' },
        { name: 'Simulator', icon: <FileText size={14} />, color: 'var(--success)' },
        { name: 'Citation', icon: <Globe size={14} />, color: 'var(--warning)' },
        { name: 'Analysis', icon: <BarChart2 size={14} />, color: 'var(--accent-primary)' }
    ];

    const { register, isAuthenticated, warmup } = useAuth();
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

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const result = await register(email, password, name);

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

    return (
        <div className="auth-container">
            {/* Top Atmospheric Half-Circles */}
            <div className="half-circle" style={{
                background: 'radial-gradient(ellipse at center, var(--accent-primary), transparent 70%)',
                width: '100vw',
                opacity: 0.15
            }}></div>
            <div className="half-circle-accent"></div>
            <div className="half-circle" style={{
                top: '-20vh',
                background: 'radial-gradient(ellipse at center, var(--accent-secondary), transparent 70%)',
                width: '120vw',
                opacity: 0.1,
                animationDelay: '-5s'
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
            <div className="aurora-container">
                <div className="aurora-blob aurora-blob-1"></div>
                <div className="aurora-blob aurora-blob-2"></div>
                <div className="aurora-blob aurora-blob-3"></div>
            </div>
            <div className="auth-card animate-fade-in">
                <div className="auth-header">
                    <div className="auth-logo">
                        <img
                            src="/no_bg_logo.png"
                            alt="Logo"
                            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'contain', marginBottom: '0.5rem' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <Sparkles size={18} color="var(--accent-secondary)" />
                            <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.03em' }}>Create Account</h1>
                        </div>
                    </div>
                    <p>Join world-class content creators optimizing for AI search</p>
                </div>

                {error && (
                    <div className="auth-error">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <div className="input-wrapper">
                            <User size={18} className="input-icon" />
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your full name"
                                autoComplete="name"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Work Email</label>
                        <div className="input-wrapper">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Create Password</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="At least 6 characters"
                                required
                                minLength={6}
                                autoComplete="new-password"
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

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                required
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                                    Creating account...
                                </span>
                            </div>
                        ) : (
                            <>
                                <UserPlus size={20} />
                                <span>Get Started with GEO</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Sign in to GEO</Link></p>
                </div>
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

export default Register;
