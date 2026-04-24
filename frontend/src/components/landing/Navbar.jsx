import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <nav style={{
            position: 'sticky',
            top: '1.5rem',
            zIndex: 1000,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
            padding: '0 1rem'
        }}>
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '2rem',
                    padding: '0.75rem 1.5rem',
                    background: 'var(--bg-secondary)',
                    opacity: 0.98,
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--bg-tertiary)',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                    pointerEvents: 'auto',
                    width: '100%',
                    maxWidth: '1200px'
                }}
            >
                {/* Logo Section */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '1px solid var(--bg-tertiary)',
                        boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <img
                            src="/no_bg_logo.png"
                            alt="Logo"
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                objectFit: 'contain'
                            }}
                        />
                    </div>
                    <span style={{
                        fontSize: '1.25rem',
                        fontWeight: '800',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        letterSpacing: '-0.04em',
                        color: 'var(--text-primary)'
                    }}>
                        GEO Tool
                    </span>
                </Link>

                {/* Desktop Links - Hidden on Mobile */}
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="hide-mobile">
                    <div style={{ width: '1px', height: '24px', background: 'var(--bg-tertiary)' }}></div>
                    <a href="#features" className="nav-link-premium">Features</a>
                    <a href="#how-it-works" className="nav-link-premium">Systems</a>
                    <a href="#pricing" className="nav-link-premium">Pricing</a>
                </div>

                {/* Actions - Desktop Only */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }} className="hide-mobile">
                    <Link to="/login" style={{
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        padding: '0.5rem 1.25rem',
                        transition: 'all 0.2s',
                        borderRadius: 'var(--radius-full)'
                    }}>
                        Sign In
                    </Link>
                    <Link to="/app" style={{
                        background: 'var(--accent-primary)',
                        color: 'white',
                        padding: '0.6rem 1.25rem',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        borderRadius: '100px',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: 'var(--accent-glow)'
                    }}>
                        Launch App <ArrowRight size={14} />
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        padding: '0.5rem'
                    }}
                    className="show-mobile"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{
                                position: 'absolute',
                                top: '100%',
                                left: '0',
                                right: '0',
                                marginTop: '1rem',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--bg-tertiary)',
                                borderRadius: '24px',
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
                                zIndex: 999
                            }}
                        >
                            <a href="#features" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '600', padding: '0.75rem' }}>Features</a>
                            <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '600', padding: '0.75rem' }}>Systems</a>
                            <a href="#pricing" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: '600', padding: '0.75rem' }}>Pricing</a>
                            <div style={{ height: '1px', background: 'var(--bg-tertiary)', margin: '0.5rem 0' }}></div>
                            <Link to="/login" onClick={() => setIsMenuOpen(false)} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '600', padding: '0.75rem' }}>Sign In</Link>
                            <Link to="/app" onClick={() => setIsMenuOpen(false)} style={{
                                background: 'var(--accent-primary)',
                                color: 'white',
                                padding: '1rem',
                                borderRadius: '16px',
                                textDecoration: 'none',
                                fontWeight: '700',
                                textAlign: 'center'
                            }}>
                                Launch App
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </nav>
    )
}

export default Navbar
