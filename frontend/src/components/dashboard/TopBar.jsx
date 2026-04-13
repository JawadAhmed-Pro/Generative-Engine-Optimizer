import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Bell, HelpCircle, User, Menu, X, Settings, LogOut, FileText, TrendingUp, ExternalLink, Zap, ArrowLeft } from 'lucide-react'
import axios from 'axios'

function TopBar({ onMenuToggle, isMobile }) {
    const navigate = useNavigate()
    const location = useLocation()
    const [showNotifications, setShowNotifications] = useState(false)
    const [showHelp, setShowHelp] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [notifications, setNotifications] = useState([])

    // Hide back button on main dashboard and app root
    const hideBackButton = location.pathname === '/app' || location.pathname === '/dashboard' || location.pathname === '/'

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
        <header className="top-bar" style={{
            background: 'rgba(3, 3, 3, 0.7)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            height: '64px',
            position: 'sticky',
            top: 0,
            zIndex: 1000
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {isMobile && (
                    <button
                        onClick={onMenuToggle}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        aria-label="Toggle navigation menu"
                    >
                        <Menu size={24} />
                    </button>
                )}
                
                {!hideBackButton && (
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-back-global"
                        title="Back"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            padding: '0.5rem 0.9rem',
                            color: 'var(--text-secondary)',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <ArrowLeft size={16} />
                        <span>Go Back</span>
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Notifications */}
                <div style={{ position: 'relative' }} onClick={stopPropagation}>
                    <button
                        title="Alerts"
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
                        aria-label="Notifications"
                        aria-haspopup="true"
                        aria-expanded={showNotifications}
                    >
                        <Bell size={20} />
                        {notifications.length > 0 && <span style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', background: 'var(--error)', borderRadius: '50%', border: '2px solid #000' }}></span>}
                    </button>
                    {showNotifications && (
                        <div className="topbar-dropdown" style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '1.25rem',
                            width: '360px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            padding: '0',
                            zIndex: 1000,
                            borderRadius: '16px'
                        }}>
                            <div className="dropdown-divider" style={{ padding: '0.75rem', borderBottom: '1px solid currentColor', fontWeight: '600', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Recent Activity</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 'normal' }}>{notifications.length} updates</span>
                            </div>
                            {notifications.length === 0 ? (
                                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                                    No new notifications
                                </div>
                            ) : (
                                notifications.map(item => (
                                    <div key={item.id} style={{
                                        padding: '0.85rem',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        display: 'flex',
                                        gap: '0.75rem',
                                        borderBottom: '1px solid currentColor'
                                    }} 
                                    className="dropdown-divider"
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} 
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                                    >
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: item.type === 'citation' ? 'rgba(66, 212, 255, 0.1)' : 'rgba(167, 139, 250, 0.1)',
                                            color: item.type === 'citation' ? 'var(--accent-primary)' : 'var(--accent-secondary)'
                                        }}>
                                            {item.type === 'citation' ? <TrendingUp size={16} /> : <FileText size={16} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                                                {item.title || 'Untitled Report'}
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
                        title="Help"
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
                        aria-label="Help"
                        aria-haspopup="true"
                        aria-expanded={showHelp}
                    >
                        <HelpCircle size={20} />
                    </button>
                    {showHelp && (
                        <div className="topbar-dropdown" style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '1.25rem',
                            width: '320px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            padding: '1.5rem',
                            zIndex: 1000,
                            borderRadius: '16px'
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
                            <div className="dropdown-divider" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid currentColor' }}>
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
                        title="Profile"
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
                        aria-label="User Profile"
                        aria-haspopup="true"
                        aria-expanded={showUserMenu}
                    >
                        <User size={20} />
                    </button>
                    {showUserMenu && (
                        <div className="topbar-dropdown" style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '1.25rem',
                            width: '240px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            padding: 0,
                            zIndex: 1000,
                            borderRadius: '16px'
                        }}>
                            <div className="dropdown-divider" style={{ padding: '1rem', borderBottom: '1px solid currentColor' }}>
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
                                    borderBottom: '1px solid currentColor'
                                }}
                                className="dropdown-divider"
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
