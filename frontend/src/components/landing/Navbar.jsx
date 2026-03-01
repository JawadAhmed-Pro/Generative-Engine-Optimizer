import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

function Navbar() {
    return (
        <nav className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img
                        src="/logo.jpg"
                        alt="Logo"
                        style={{
                            width: '32px',
                            height: '32px',
                            objectFit: 'contain',
                            borderRadius: '8px'
                        }}
                    />
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'Outfit, sans-serif' }}>
                        GEO Tool
                    </span>
                </div>

                {/* Links */}
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>Features</a>
                    <a href="#how-it-works" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>How it Works</a>
                    <a href="#pricing" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>Pricing</a>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link to="/login" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>
                        Log In
                    </Link>
                    <Link to="/app" className="btn btn-secondary" style={{
                        background: 'white',
                        color: 'black',
                        padding: '0.5rem 1rem',
                        fontSize: '0.9rem',
                        borderRadius: '6px'
                    }}>
                        Launch App
                    </Link>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
