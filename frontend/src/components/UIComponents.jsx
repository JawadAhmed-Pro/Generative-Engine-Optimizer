import { AlertCircle, RefreshCw } from 'lucide-react'

// Skeleton Loader Component
export function SkeletonCard() {
    return (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '70%' }}></div>
        </div>
    )
}

// Loading Spinner Component
export function LoadingSpinner({ size = 24, text = "Loading..." }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '2rem'
        }}>
            <RefreshCw size={size} className="spin" color="var(--accent-primary)" />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{text}</span>
        </div>
    )
}

// Error Alert Component
export function ErrorAlert({ message, onRetry }) {
    return (
        <div className="error-alert">
            <AlertCircle size={20} />
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>Error</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{message}</div>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="btn btn-outline"
                    style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}
                >
                    Retry
                </button>
            )}
        </div>
    )
}

// Empty State Component
export function EmptyState({ icon: Icon, title, description }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem',
            textAlign: 'center'
        }}>
            <div style={{
                width: '64px',
                height: '64px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--card-border)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
            }}>
                <Icon size={28} color="var(--text-secondary)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>{title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '280px' }}>
                {description}
            </p>
        </div>
    )
}

// Page Loading Component
export function PageLoading() {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh'
        }}>
            <LoadingSpinner size={40} text="Loading page..." />
        </div>
    )
}
