import { Link } from 'react-router-dom'
import { ArrowRight, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

function Navbar() {
    return (
        <nav style={{
            position: 'sticky',
            top: '1.5rem',
            zIndex: 1000,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none' // Allow clicks through the parent container
        }}>
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4rem',
                    padding: '0.75rem 2rem',
                    background: 'var(--bg-secondary)',
                    opacity: 0.98,
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--bg-tertiary)',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                    pointerEvents: 'auto', // Re-enable clicks for the pill itself
                    maxWidth: 'fit-content'
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

                {/* Vertical Divider */}
                <div style={{ width: '1px', height: '28px', background: 'var(--bg-tertiary)' }}></div>

                {/* Links */}
                <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
                    <a href="#features" className="nav-link-premium">Features</a>
                    <a href="#how-it-works" className="nav-link-premium">Systems</a>
                    <a href="#pricing" className="nav-link-premium">Pricing</a>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <Link to="/login" style={{
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        padding: '0.5rem 1.25rem',
                        transition: 'all 0.2s',
                        borderRadius: 'var(--radius-full)'
                    }} onMouseOver={(e) => { e.target.style.color = 'var(--text-primary)'; e.target.style.background = 'var(--bg-tertiary)'; }} onMouseOut={(e) => { e.target.style.color = 'var(--text-secondary)'; e.target.style.background = 'transparent'; }}>
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
                        boxShadow: 'var(--accent-glow)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                        Launch App <ArrowRight size={14} />
                    </Link>
                </div>
            </motion.div>
        </nav>
    )
}

export default Navbar
