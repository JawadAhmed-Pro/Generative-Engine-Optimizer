import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo })
        // Log error to monitoring service in production
        console.error('Error caught by boundary:', error, errorInfo)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
        if (this.props.onReset) {
            this.props.onReset()
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '50vh',
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.5rem'
                    }}>
                        <AlertTriangle size={40} color="#EF4444" />
                    </div>

                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                        color: 'var(--text-primary)'
                    }}>
                        Something went wrong
                    </h2>

                    <p style={{
                        color: 'var(--text-secondary)',
                        marginBottom: '1.5rem',
                        maxWidth: '400px'
                    }}>
                        An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={this.handleReset}
                            className="btn btn-primary"
                            style={{ gap: '0.5rem' }}
                        >
                            <RefreshCw size={18} />
                            Try Again
                        </button>
                        <button
                            onClick={() => window.location.href = '/app'}
                            className="btn btn-outline"
                        >
                            Go to Dashboard
                        </button>
                    </div>

                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details style={{
                            marginTop: '2rem',
                            padding: '1rem',
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '8px',
                            textAlign: 'left',
                            maxWidth: '600px',
                            width: '100%'
                        }}>
                            <summary style={{
                                cursor: 'pointer',
                                color: 'var(--error)',
                                marginBottom: '0.5rem'
                            }}>
                                Error Details (Development Only)
                            </summary>
                            <pre style={{
                                fontSize: '0.75rem',
                                overflow: 'auto',
                                color: 'var(--text-secondary)'
                            }}>
                                {this.state.error.toString()}
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
