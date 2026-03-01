import { useState } from 'react'
import { User, Bell, Shield, Moon, Sun, Trash2, RefreshCw, AlertTriangle } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

function Settings() {
    const [activeTab, setActiveTab] = useState('profile') // 'profile', 'preferences', 'data'

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Settings</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Manage your account and preferences</p>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '2rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                marginBottom: '2rem'
            }}>
                <TabButton
                    active={activeTab === 'profile'}
                    onClick={() => setActiveTab('profile')}
                    label="Profile & Account"
                />
                <TabButton
                    active={activeTab === 'preferences'}
                    onClick={() => setActiveTab('preferences')}
                    label="App Preferences"
                />
                <TabButton
                    active={activeTab === 'data'}
                    onClick={() => setActiveTab('data')}
                    label="Data Management"
                    danger={activeTab === 'data'}
                />
            </div>

            {/* Content */}
            <div className="settings-content">
                {activeTab === 'profile' && <ProfileTab />}
                {activeTab === 'preferences' && <PreferencesTab />}
                {activeTab === 'data' && <DataTab />}
            </div>
        </div>
    )
}

function TabButton({ active, onClick, label, danger }) {
    return (
        <button
            onClick={onClick}
            style={{
                background: 'none',
                border: 'none',
                padding: '0.75rem 0',
                marginRight: '1rem',
                color: active ? (danger ? 'var(--error)' : 'var(--accent-primary)') : 'var(--text-secondary)',
                borderBottom: active ? `2px solid ${danger ? 'var(--error)' : 'var(--accent-primary)'}` : '2px solid transparent',
                cursor: 'pointer',
                fontWeight: active ? '600' : '500',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease'
            }}
        >
            {label}
        </button>
    )
}

function ProfileTab() {
    const { user } = useAuth()

    return (
        <div className="animate-fade-in">
            {/* User Details */}
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>User Details</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>FULL NAME</label>
                        <input
                            type="text"
                            defaultValue={user?.name || ''}
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                padding: '0.75rem 1rem',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>EMAIL ADDRESS</label>
                        <input
                            type="email"
                            defaultValue={user?.email || ''}
                            readOnly
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                padding: '0.75rem 1rem',
                                color: 'rgba(255,255,255,0.7)',
                                fontSize: '1rem',
                                cursor: 'not-allowed'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Current Plan */}
            <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Current Plan</h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        You are currently on the <strong style={{ color: 'white' }}>Pro Plan</strong>.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{
                            background: 'rgba(124, 58, 237, 0.2)',
                            color: '#a78bfa',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '700'
                        }}>
                            PRO
                        </span>
                        <button className="btn btn-outline">Manage Subscription</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function PreferencesTab() {
    const [defaultDomain, setDefaultDomain] = useState(() => localStorage.getItem('geo_default_domain') || 'general')
    const [saved, setSaved] = useState(false)

    const handleDomainChange = (domain) => {
        setDefaultDomain(domain)
        localStorage.setItem('geo_default_domain', domain)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div className="animate-fade-in">
            {/* Default Domain */}
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Default Domain</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Set your preferred content domain for analysis and optimization.</p>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => handleDomainChange('educational')}
                        className={`btn ${defaultDomain === 'educational' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ flex: 1 }}
                    >
                        📚 Education
                    </button>
                    <button
                        onClick={() => handleDomainChange('ecommerce')}
                        className={`btn ${defaultDomain === 'ecommerce' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ flex: 1 }}
                    >
                        🛒 E-commerce
                    </button>
                    <button
                        onClick={() => handleDomainChange('general')}
                        className={`btn ${defaultDomain === 'general' ? 'btn-primary' : 'btn-outline'}`}
                        style={{ flex: 1 }}
                    >
                        📝 General
                    </button>
                </div>
                {saved && (
                    <p style={{ color: 'var(--success)', marginTop: '1rem', fontSize: '0.875rem' }}>✓ Preference saved!</p>
                )}
            </div>

            {/* Theme */}
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Theme</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Customize the application's appearance.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <ThemeOption
                        icon={<Moon size={20} />}
                        title="Dark Mode"
                        description="Easy on the eyes, perfect for night work"
                        value="dark"
                    />
                    <ThemeOption
                        icon={<Sun size={20} />}
                        title="Light Mode"
                        description="Clean and bright, great for daytime"
                        value="light"
                    />
                </div>
            </div>


        </div>
    )
}

function ThemeOption({ icon, title, description, value }) {
    const { theme, setTheme } = useTheme()
    const isActive = theme === value

    return (
        <div
            onClick={() => setTheme(value)}
            style={{
                background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.05)',
                padding: '1rem',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: isActive ? '1px solid var(--accent-primary)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {icon}
                <div>
                    <div style={{ fontWeight: '600' }}>{title}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{description}</div>
                </div>
            </div>
            {isActive && (
                <div style={{ width: '20px', height: '20px', background: 'var(--accent-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }}></div>
                </div>
            )}
        </div>
    )
}

function DataTab() {
    const { token, logout } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const handleAction = async (action, endpoint, method = 'DELETE') => {
        if (!window.confirm(`Are you sure you want to ${action}? This cannot be undone.`)) return

        setLoading(true)
        setMessage('')
        try {
            await axios({
                method,
                url: `http://localhost:8000${endpoint}`,
                headers: { Authorization: `Bearer ${token}` }
            })
            setMessage(`${action} completed successfully.`)
            if (action === 'Factory Reset') {
                logout()
                navigate('/login')
            }
        } catch (error) {
            console.error(error)
            setMessage(`Error: ${error.response?.data?.detail || 'Action failed'}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="animate-fade-in">
            <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--error)' }}>
                    <AlertTriangle size={24} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Danger Zone</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>These actions are irreversible. Please be certain before proceeding.</p>

                {message && (
                    <div style={{
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        borderRadius: '8px',
                        background: message.startsWith('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: message.startsWith('Error') ? 'var(--error)' : 'var(--success)',
                        border: `1px solid ${message.startsWith('Error') ? 'var(--error)' : 'var(--success)'}`
                    }}>
                        {message}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Clear History */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div>
                            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Clear History</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Removes all generated content and analysis reports.</div>
                        </div>
                        <button
                            onClick={() => handleAction('Clear History', '/api/history')}
                            disabled={loading}
                            className="btn"
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'white',
                                padding: '0.5rem 1rem',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Processing...' : 'Clear History'}
                        </button>
                    </div>

                    {/* Delete Projects */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div>
                            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Delete All Projects</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Removes all project containers and associations.</div>
                        </div>
                        <button
                            onClick={() => handleAction('Delete Projects', '/api/projects')}
                            disabled={loading}
                            className="btn"
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'white',
                                padding: '0.5rem 1rem',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Processing...' : 'Delete Projects'}
                        </button>
                    </div>

                    {/* Factory Reset */}
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--error)' }}>Factory Reset</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--error)', opacity: 0.8 }}>Wipes all local data, settings, and resets the app.</div>
                        </div>
                        <button
                            onClick={() => handleAction('Factory Reset', '/api/reset', 'POST')}
                            disabled={loading}
                            className="btn"
                            style={{ background: 'var(--error)', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
                        >
                            {loading ? 'Processing...' : 'Reset App'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings
