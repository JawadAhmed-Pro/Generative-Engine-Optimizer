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
                background: 'radial-gradient(circle, rgba(66, 212, 255, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(80px)'
            }} />

            <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                {/* 404 Number */}
                <div style={{
                    fontSize: '10rem',
                    fontWeight: '800',
                    lineHeight: 1,
                    background: 'linear-gradient(135deg, #ef4444 0%, #f97316 50%, #eab308 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '1rem'
                }}>
                    404
                </div>

                {/* Icon */}
                <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem'
                }}>
                    <AlertTriangle size={40} color="#ef4444" />
                </div>

                {/* Message */}
                <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                    Page Not Found
                </h1>
                <p style={{
                    color: 'var(--text-secondary)',
                    maxWidth: '400px',
                    margin: '0 auto 2rem',
                    lineHeight: 1.6
                }}>
                    The page you're looking for doesn't exist or has been moved.
                </p>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link
                        to="/app"
                        className="btn btn-primary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.875rem 1.5rem',
                            fontSize: '0.9rem',
                            textDecoration: 'none'
                        }}
                    >
                        <Home size={18} /> Go to Dashboard
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.875rem 1.5rem',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        <ArrowLeft size={18} /> Go Back
                    </button>
                </div>

                {/* Help text */}
                <p style={{
                    marginTop: '3rem',
                    color: 'var(--text-tertiary)',
                    fontSize: '0.85rem'
                }}>
                    Need help? Contact support or check the documentation.
                </p>
            </div>
        </div>
    )
}

export default NotFound
