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
            {/* Subtle Texture/Grain */}
            <div className="noise-overlay" style={{ opacity: 0.02 }}></div>

            {/* Logo Section */}
            <div style={{
                padding: '2rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
            }}>
                <img
                    src="/no_bg_logo.png"
                    alt="Logo"
                    style={{
                        width: '28px',
                        height: '28px',
                        objectFit: 'contain'
                    }}
                />
                {!collapsed && (
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '900', color: 'white', lineHeight: '1.2' }}>Generative Engine</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: '600' }}>Optimizer</div>
                    </div>
                )}
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
                                    gap: '1rem',
                                    padding: '0.75rem 1.25rem',
                                    borderRadius: '8px',
                                    color: isActive ? 'white' : 'var(--text-secondary)',
                                    background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                                    textDecoration: 'none',
                                    fontSize: '0.85rem',
                                    fontWeight: isActive ? '700' : '600',
                                    transition: 'all 0.2s ease',
                                    margin: '0 0.5rem'
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

            {/* User Footer Profile */}
            <div style={{ padding: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: collapsed ? 'center' : 'space-between', 
                        gap: '0.75rem'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '800',
                            fontSize: '0.75rem'
                        }}>
                            {getInitials()[0]}
                        </div>
                        {!collapsed && (
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'white' }}>Premium</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: '600' }}>Member</div>
                            </div>
                        )}
                    </div>
                    {!collapsed && (
                        <button
                            onClick={() => navigate('/app/settings')}
                            style={{
                                color: 'var(--text-tertiary)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.4rem',
                                display: 'flex'
                            }}
                        >
                            <Settings size={18} />
                        </button>
                    )}
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
