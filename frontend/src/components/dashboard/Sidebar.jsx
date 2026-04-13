import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Folder, FileText, BarChart2, Settings, LogOut, Code2, Zap, Globe, GitCompareArrows, Sparkles, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

function Sidebar({ collapsed, onToggle, mobileOpen = false }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    // Get user initials
    const getInitials = () => {
        if (!user) return '??'
        if (user.name) {
            return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        }
        return user.email.slice(0, 2).toUpperCase()
    }

    const navItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/app', end: true },
        { icon: <Folder size={20} />, label: 'Projects', path: '/app/projects' },
        { icon: <FileText size={20} />, label: 'Content Optimization', path: '/app/optimization' },
        { icon: <Zap size={20} />, label: 'AI Simulator', path: '/app/ai-simulator' },
        { icon: <BarChart2 size={20} />, label: 'Visibility Analysis', path: '/app/visibility' },
        { icon: <Globe size={20} />, label: 'Citation Tracking', path: '/app/citations' },
        { icon: <GitCompareArrows size={20} />, label: 'Competitor Analysis', path: '/app/competitors' },
        { icon: <Sparkles size={20} />, label: 'Content Strategy', path: '/app/strategy' },
        { icon: <Settings size={20} />, label: 'Settings', path: '/app/settings' },
    ]

    return (
        <aside className={`sidebar-container ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
            {/* Animated Background Layer */}
            <div className="sidebar-aurora">
                <div className="sidebar-blob sidebar-blob-1"></div>
                <div className="sidebar-blob sidebar-blob-2"></div>
                <div className="noise-overlay" style={{ opacity: 0.03 }}></div>
            </div>

            {/* Logo & Toggle */}
            <div style={{
                padding: collapsed ? '1rem 0.5rem' : '1.25rem 1rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                position: 'relative'
            }}>
                {/* Header Glow */}
                {!collapsed && (
                    <div style={{
                        position: 'absolute',
                        bottom: '-1px',
                        left: '0',
                        right: '0',
                        height: '1px',
                        background: 'var(--accent-gradient)',
                        opacity: 0.2
                    }}></div>
                )}
                <div 
                    onClick={() => navigate('/app/settings')}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.75rem',
                        cursor: 'pointer'
                    }}
                    title="Open Settings"
                >
                    {!collapsed && (
                        <>
                            <img
                                src="/no_bg_logo.png"
                                alt="Logo"
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    objectFit: 'contain',
                                    borderRadius: '50%'
                                }}
                            />
                            <div>
                                <h1 style={{ fontSize: '1rem', fontWeight: '700', lineHeight: '1.2', whiteSpace: 'nowrap' }}>Generative Engine</h1>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Optimizer</div>
                            </div>
                        </>
                    )}
                </div>
                <button
                    onClick={onToggle}
                    title={collapsed ? "Expand" : "Collapse"}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '0.6rem',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        background: 'rgba(255,255,255,0.05)',
                        marginLeft: collapsed ? 'auto' : '0',
                        marginRight: collapsed ? 'auto' : '0'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                </button>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: collapsed ? '0.5rem' : '0.75rem 0.75rem', overflowY: 'auto', overflowX: 'hidden' }}>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                end={item.end}
                                title={collapsed ? item.label : undefined}
                                className={({ isActive }) => isActive ? 'active-nav-item' : 'nav-item'}
                                style={({ isActive }) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0', // Square active indicators
                                    color: isActive ? '#00d2ff' : 'rgba(255,255,255,0.4)',
                                    background: isActive ? 'linear-gradient(to right, rgba(0, 210, 255, 0.08), transparent)' : 'transparent',
                                    textDecoration: 'none',
                                    fontSize: '0.85rem',
                                    fontWeight: isActive ? '700' : '500',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    borderLeft: isActive ? '2px solid #00d2ff' : '2px solid transparent'
                                })}
                            >
                                <div style={{ 
                                    color: 'inherit',
                                    filter: 'drop-shadow(0 0 8px currentColor)',
                                    opacity: 1
                                }}>
                                    {item.icon}
                                </div>
                                {!collapsed && <span style={{ transition: 'all 0.3s ease', letterSpacing: '0.01em' }}>{item.label}</span>}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* User Profile */}
            <div style={{ padding: collapsed ? '1rem 0.5rem' : '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div 
                    onClick={() => navigate('/app/settings')}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: collapsed ? 'center' : 'flex-start', 
                        gap: '0.75rem',
                        cursor: 'pointer'
                    }}
                    title="Profile Settings"
                >
                    <div style={{
                        width: '40px',
                        height: '40px',
                        minWidth: '40px',
                        background: 'var(--accent-secondary)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '0.85rem'
                    }}>
                        {getInitials()}
                    </div>
                    {!collapsed && (
                        <>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    Premium <Sparkles size={12} color="#FFD700" fill="#FFD700" />
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                                    Member
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleLogout();
                                }}
                                title="Logout"
                                aria-label="Logout"
                                style={{
                                    color: 'var(--text-secondary)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '0.5rem',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                            >
                                <LogOut size={18} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
