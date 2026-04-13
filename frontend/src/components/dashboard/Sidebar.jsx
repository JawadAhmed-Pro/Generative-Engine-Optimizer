import { LayoutDashboard, Folder, FileText, BarChart2, Settings, LogOut, Code2, Zap, Globe, GitCompareArrows, Sparkles, PanelLeftClose, PanelLeftOpen, Sun, Moon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

function Sidebar({ collapsed, onToggle, mobileOpen = false }) {
    const { user, logout } = useAuth()
    const { theme, toggleTheme, isDark } = useTheme()
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
            <div className="noise-overlay" style={{ opacity: isDark ? 0.02 : 0.01 }}></div>

            {/* Header & Logo Section */}
            <div style={{
                padding: collapsed ? '1.25rem 0.5rem' : '1.5rem 1.25rem',
                borderBottom: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div 
                        onClick={() => navigate('/app')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                    >
                        <img src="/no_bg_logo.png" alt="GEO" style={{ width: '28px', height: '28px', opacity: isDark ? 0.8 : 1 }} />
                        {!collapsed && (
                             <div style={{ fontSize: '0.85rem', fontWeight: '900', color: isDark ? 'white' : '#0F172A', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                GEO Engine
                             </div>
                        )}
                    </div>
                    <button onClick={onToggle} style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                    </button>
                </div>
                
                {!collapsed && (
                    <button 
                        onClick={toggleTheme}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '8px',
                            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                            border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                            color: 'var(--text-secondary)',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {isDark ? <Moon size={14} /> : <Sun size={14} />}
                            {isDark ? 'Obsidian Mode' : 'Pearl Mode'}
                        </div>
                        <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>Alt+T</span>
                    </button>
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
                                    gap: '0.75rem',
                                    padding: '0.75rem 1.25rem',
                                    borderRadius: '0',
                                    color: isActive 
                                        ? (isDark ? 'white' : '#0F172A') 
                                        : 'var(--text-secondary)',
                                    background: isActive 
                                        ? (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)') 
                                        : 'transparent',
                                    textDecoration: 'none',
                                    fontSize: '0.85rem',
                                    fontWeight: isActive ? '700' : '500',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    borderLeft: isActive 
                                        ? `2px solid ${isDark ? '#94A3B8' : '#0F172A'}` 
                                        : '2px solid transparent'
                                })}
                            >
                                <div style={{ 
                                    color: 'inherit',
                                    opacity: isActive ? 1 : 0.6
                                }}>
                                    {item.icon}
                                </div>
                                {!collapsed && <span style={{ letterSpacing: '0.01em' }}>{item.label}</span>}
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
                        width: '36px',
                        height: '36px',
                        minWidth: '36px',
                        background: isDark ? 'var(--accent-gradient)' : '#0F172A',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isDark ? '#0F172A' : 'white',
                        fontWeight: '800',
                        fontSize: '0.75rem',
                        boxShadow: isDark ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        {getInitials()}
                    </div>
                    {!collapsed && (
                        <>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: isDark ? 'white' : '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    Premium <Sparkles size={12} color={isDark ? '#94A3B8' : '#B59410'} fill={isDark ? '#94A3B8' : '#B59410'} />
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Executive
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
