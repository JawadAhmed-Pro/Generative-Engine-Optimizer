import { createContext, useContext, useState, useCallback } from 'react'
import { Check, X, AlertCircle, Info } from 'lucide-react'

const ToastContext = createContext()

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within ToastProvider')
    }
    return context
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, duration)
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const toast = {
        success: (message) => addToast(message, 'success'),
        error: (message) => addToast(message, 'error', 5000),
        info: (message) => addToast(message, 'info'),
        warning: (message) => addToast(message, 'warning')
    }

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    )
}

function ToastContainer({ toasts, onRemove }) {
    if (toasts.length === 0) return null

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <Check size={18} />
            case 'error': return <X size={18} />
            case 'warning': return <AlertCircle size={18} />
            default: return <Info size={18} />
        }
    }

    const getColors = (type) => {
        switch (type) {
            case 'success': return { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', icon: '#10b981' }
            case 'error': return { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', icon: '#ef4444' }
            case 'warning': return { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', icon: '#f59e0b' }
            default: return { bg: 'rgba(66, 212, 255, 0.15)', border: 'var(--accent-primary)', icon: 'var(--accent-primary)' }
        }
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            zIndex: 9999
        }}>
            {toasts.map(toast => {
                const colors = getColors(toast.type)
                return (
                    <div
                        key={toast.id}
                        className="animate-fade-in"
                        style={{
                            background: colors.bg,
                            backdropFilter: 'blur(12px)',
                            border: `1px solid ${colors.border}`,
                            borderRadius: '10px',
                            padding: '0.875rem 1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            minWidth: '280px',
                            maxWidth: '400px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                        }}
                    >
                        <div style={{ color: colors.icon }}>
                            {getIcon(toast.type)}
                        </div>
                        <span style={{ flex: 1, fontSize: '0.9rem' }}>{toast.message}</span>
                        <button
                            onClick={() => onRemove(toast.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-tertiary)',
                                cursor: 'pointer',
                                padding: '0.25rem'
                            }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}

export default ToastProvider
