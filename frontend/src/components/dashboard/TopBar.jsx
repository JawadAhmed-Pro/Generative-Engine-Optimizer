import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, HelpCircle, User, Menu, X, Settings, LogOut, FileText, TrendingUp, ExternalLink, Zap } from 'lucide-react'
import axios from 'axios'

function TopBar({ onMenuToggle }) {
    const [showNotifications, setShowNotifications] = useState(false)
    const [showHelp, setShowHelp] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [notifications, setNotifications] = useState([])

    useEffect(() => {
        if (showNotifications) {
            fetchNotifications()
        }
    }, [showNotifications])

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('/api/history?limit=5')
            setNotifications(response.data.items || [])
        } catch (err) {
            setNotifications([])
        }
    }

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClick = () => {
            setShowNotifications(false)
            setShowHelp(false)
            setShowUserMenu(false)
        }
        document.addEventListener('click', handleClick)
        return () => document.removeEventListener('click', handleClick)
    }, [])

    const stopPropagation = (e) => e.stopPropagation()

    return (
        <header style={{
            height: '64px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            background: 'var(--bg-primary)',
            position: 'sticky',
            top: 0,
            zIndex: 40
        }}>
            <button
                onClick={onMenuToggle}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
                <Menu size={24} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Notifications */}
                <div style={{ position: 'relative' }} onClick={stopPropagation}>
                    <button
                        onClick={() => {
                            setShowNotifications(!showNotifications)
                            setShowHelp(false)
                            setShowUserMenu(false)
                        }}
                        style={{
                            background: showNotifications ? 'rgba(255,255,255,0.1)' : 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '8px'
                        }}
                    >
                        <Bell size={20} />
                    </button>
                    {showNotifications && (
                        <div className="glass-card animate-fade-in" style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '0.5rem',
                            width: '320px',
                            padding: 0,
                            overflow: 'hidden'
                        }}>
                            <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: '600' }}>
                                Recent Activity
                            </div>
                            {notifications.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    No recent activity
                                </div>
                            ) : (
                                notifications.map(item => (
                                    <div key={item.id} style={{
                                        padding: '0.75rem 1rem',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            background: item.type === 'url' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {item.type === 'url' ? <TrendingUp size={14} /> : <FileText size={14} />}
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {item.title || 'Untitled'}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                                Score: {item.score?.toFixed(1) || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <Link
                                to="/app/visibility"
                                style={{
                                    display: 'block',
                                    padding: '0.75rem',
                                    textAlign: 'center',
                                    color: 'var(--accent-primary)',
                                    fontSize: '0.8rem',
                                    textDecoration: 'none'
                                }}
                            >
                                View all history →
                            </Link>
                        </div>
                    )}
                </div>

                {/* Help */}
                <div style={{ position: 'relative' }} onClick={stopPropagation}>
                    <button
                        onClick={() => {
                            setShowHelp(!showHelp)
                            setShowNotifications(false)
                            setShowUserMenu(false)
                        }}
                        style={{
                            background: showHelp ? 'rgba(255,255,255,0.1)' : 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '8px'
                        }}
                    >
                        <HelpCircle size={20} />
                    </button>
                    {showHelp && (
                        <div className="glass-card animate-fade-in" style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '0.5rem',
                            width: '280px',
                            padding: '1rem'
                        }}>
                            <h4 style={{ fontWeight: '600', marginBottom: '1rem' }}>Quick Help</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                                <div>
                                    <strong style={{ color: 'var(--accent-primary)' }}>Visibility Analysis</strong>
                                    <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0' }}>Analyze how AI sees your web pages</p>
                                </div>
                                <div>
                                    <strong style={{ color: 'var(--accent-secondary)' }}>Content Optimizer</strong>
                                    <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0' }}>Rewrite content for better AI visibility</p>
                                </div>
                                <div>
                                    <strong style={{ color: 'var(--warning)' }}>AI Simulator</strong>
                                    <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0' }}>Test if AI would cite your content</p>
                                </div>
                            </div>
                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <a
                                    href="https://github.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <ExternalLink size={12} /> Documentation
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* User Menu */}
                <div style={{ position: 'relative' }} onClick={stopPropagation}>
                    <button
                        onClick={() => {
                            setShowUserMenu(!showUserMenu)
                            setShowNotifications(false)
                            setShowHelp(false)
                        }}
                        style={{
                            background: showUserMenu ? 'rgba(255,255,255,0.1)' : 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '8px'
                        }}
                    >
                        <User size={20} />
                    </button>
                    {showUserMenu && (
                        <div className="glass-card animate-fade-in" style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '0.5rem',
                            width: '200px',
                            padding: 0,
                            overflow: 'hidden'
                        }}>
                            <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontWeight: '600' }}>User Account</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pro Plan</div>
                            </div>
                            <Link
                                to="/app/settings"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    color: 'var(--text-primary)',
                                    textDecoration: 'none',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                                }}
                            >
                                <Settings size={16} /> Settings
                            </Link>
                            <button
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--error)',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default TopBar
