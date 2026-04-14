import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Search, AlertTriangle } from 'lucide-react'

function NotFound() {
    return (
        <div className="aurora-container" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated Aurora Blobs */}
            <div className="aurora-blob aurora-blob-1" style={{ opacity: 0.15 }}></div>
            <div className="aurora-blob aurora-blob-2" style={{ opacity: 0.1 }}></div>
            <div className="aurora-blob aurora-blob-3" style={{ opacity: 0.15 }}></div>
            {/* Background decoration */}
            <div style={{
                position: 'absolute',
                top: '30%',
                left: '20%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(60px)'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '20%',
                right: '20%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(80px)'
            }} />

            <div className="glass glow-high" style={{ 
                textAlign: 'center', 
                position: 'relative', 
                zIndex: 1,
                padding: '4.5rem 3rem',
                borderRadius: '32px',
                maxWidth: '600px',
                width: '100%',
                background: 'rgba(10, 10, 18, 0.6)',
                border: '1px solid rgba(96, 165, 250, 0.2)',
                boxShadow: 'var(--elevation-high)'
            }}>
                {/* 404 Number */}
                <div style={{
                    fontSize: '10rem',
                    fontWeight: '900',
                    lineHeight: 1,
                    background: 'linear-gradient(135deg, #ef4444 0%, #f97316 50%, #eab308 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '1rem',
                    filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.3))'
                }}>
                    404
                </div>

                {/* Icon */}
                <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.1)'
                }}>
                    <AlertTriangle size={40} color="#ef4444" />
                </div>

                {/* Message */}
                <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.75rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    Page Not Found
                </h1>
                <p style={{
                    color: 'var(--text-secondary)',
                    maxWidth: '400px',
                    margin: '0 auto 2.5rem',
                    lineHeight: 1.6,
                    fontSize: '1.1rem'
                }}>
                    The atmospheric coordinates for this page don't exist in the GEO Perception Layer.
                </p>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link
                        to="/app"
                        className="btn btn-primary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '1rem 1.75rem',
                            fontSize: '0.95rem',
                            fontWeight: '700',
                            textDecoration: 'none',
                            background: 'var(--accent-gradient)',
                            border: 'none',
                            boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
                        }}
                    >
                        <Home size={20} /> Go to Dashboard
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="btn-outline"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            padding: '1rem 1.75rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: '700'
                        }}
                    >
                        <ArrowLeft size={20} /> Orbit Back
                    </button>
                </div>

                {/* Help text */}
                <p style={{
                    marginTop: '3.5rem',
                    color: 'var(--text-tertiary)',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                }}>
                    Need navigation assistance? <span style={{ color: 'var(--accent-primary)', cursor: 'pointer' }}>Contact support</span>
                </p>
            </div>
        </div>
    )
}

export default NotFound
