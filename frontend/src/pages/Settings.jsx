import React, { useState } from 'react'
import { User, Bell, Shield, Moon, Sun, Trash2, RefreshCw, AlertTriangle, Sparkles, Globe, ShoppingCart, BookOpen, CreditCard, Mail, Settings as SettingsIcon, ChevronRight, Camera, UserPlus, LogOut, Check } from 'lucide-react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
    return (
        <div className="animate-fade-in settings-container" style={{ paddingBottom: '6rem' }}>
            <div style={{ width: '100%' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '3rem', marginTop: '0' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <Sparkles size={20} color="var(--accent-primary)" />
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                                GEO Control Center
                            </span>
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.04em', margin: 0 }}>
                            App Settings
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                            Configure your account preferences, content defaults, and workspace stability.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    {/* Section 1: Account & Profile */}
                    <SettingsSection
                        title="Account & Subscription"
                        description="Manage your personal information and billing details."
                        icon={<User size={20} color="var(--accent-primary)" />}
                    >
                        <ProfileCard />
                        <AccountManagementCard />
                        <PlanCard />
                    </SettingsSection>

                    {/* Section 2: Personalization */}
                    <SettingsSection
                        title="App Personalization"
                        description="Customize your workflow defaults and appearance."
                        icon={<SettingsIcon size={20} color="var(--accent-primary)" />}
                    >
                        <PreferencesCard />
                        <ThemeCard />
                    </SettingsSection>

                    {/* Section 3: Data & Security */}
                    <SettingsSection
                        title="Workspace Management"
                        description="Administrative tools for data integrity and project resets."
                        icon={<Shield size={20} color="var(--error)" />}
                    >
                        <DataCard />
                    </SettingsSection>
                </div>
            </div>

            <style>{`
                .settings-container .depth-card {
                    background: rgba(0, 0, 0, 0.4) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                }
                .settings-container .glass-card {
                    background: rgba(0, 0, 0, 0.3) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                }
                .settings-container .account-item {
                    background: rgba(255, 255, 255, 0.02);
                    padding: 1rem;
                    border-radius: 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    transition: all 0.3s ease;
                }
                .settings-container .account-item:hover {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(66, 212, 255, 0.3);
                }
                .avatar-container {
                    width: 100px;
                    height: 100px;
                    border-radius: 20px;
                    overflow: hidden;
                    position: relative;
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.3s ease;
                }
                .avatar-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .avatar-container:hover .avatar-overlay {
                    opacity: 1;
                }
            `}</style>
        </div>
    )
}

function SettingsSection({ title, description, icon, children }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ 
                padding: '1rem 0 1rem 1rem', 
                borderLeft: '4px solid var(--accent-primary)',
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '0 8px 8px 0',
                marginBottom: '0.5rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {icon}
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>{title}</h2>
                </div>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', margin: '0.35rem 0 0 0' }}>{description}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {children}
            </div>
        </div>
    )
}

function ProfileCard() {
    const { user } = useAuth()
    const [profilePhoto, setProfilePhoto] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [name, setName] = useState(user?.name || '')
    const [saving, setSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const fileInputRef = React.useRef(null)

    const handlePhotoChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setProfilePhoto(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSave = () => {
        setSaving(true)
        // Simulate API call
        setTimeout(() => {
            setSaving(false)
            setIsEditing(false)
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        }, 1200)
    }

    return (
        <div className="depth-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div 
                        className="avatar-container" 
                        onClick={() => fileInputRef.current?.click()}
                        style={{ cursor: isEditing ? 'pointer' : 'default' }}
                    >
                        {profilePhoto ? (
                            <img src={profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>
                                <User size={40} />
                            </div>
                        )}
                        {isEditing && (
                            <div className="avatar-overlay">
                                <Camera size={24} color="white" />
                            </div>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handlePhotoChange} 
                            style={{ display: 'none' }} 
                            accept="image/*"
                            disabled={!isEditing}
                        />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>{name || 'Authorized User'}</h3>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Management portal for your digital identity.</p>
                        {isEditing && (
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="btn btn-outline" 
                                style={{ marginTop: '0.75rem', fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                            >
                                <Camera size={14} style={{ marginRight: '0.4rem' }} /> Update Avatar
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {isEditing ? (
                        <>
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="btn btn-outline"
                                style={{ fontSize: '0.85rem', padding: '0.6rem 1.25rem' }}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                className="btn btn-primary"
                                style={{ fontSize: '0.85rem', padding: '0.6rem 1.25rem', minWidth: '120px' }}
                                disabled={saving}
                            >
                                {saving ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <RefreshCw size={14} className="animate-spin" /> Saving...
                                    </span>
                                ) : 'Save Changes'}
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="btn btn-outline"
                            style={{ fontSize: '0.85rem', padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <SettingsIcon size={16} /> Edit Profile
                        </button>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-tertiary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <User size={14} /> Full Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        readOnly={!isEditing}
                        className={isEditing ? 'focus-ring' : ''}
                        style={{
                            width: '100%',
                            background: isEditing ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.02)',
                            border: isEditing ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '10px',
                            padding: '0.85rem 1rem',
                            color: isEditing ? 'white' : 'var(--text-secondary)',
                            fontSize: '0.95rem',
                            cursor: isEditing ? 'text' : 'not-allowed',
                            transition: 'all 0.3s ease'
                        }}
                    />
                </div>
                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-tertiary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <Mail size={14} /> Email Address
                    </label>
                    <input
                        type="email"
                        defaultValue={user?.email || ''}
                        readOnly
                        style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.01)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '10px',
                            padding: '0.85rem 1rem',
                            color: 'var(--text-tertiary)',
                            fontSize: '0.95rem',
                            cursor: 'not-allowed',
                            opacity: 0.6
                        }}
                    />
                </div>
            </div>

            {saveSuccess && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: '1.5rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}
                >
                    <Check size={18} /> Account details updated successfully!
                </motion.div>
            )}
        </div>
    )
}

function AccountManagementCard() {
    const { user } = useAuth()
    const [accounts, setAccounts] = useState([
        { id: 1, name: user?.name || 'Main User', email: user?.email || 'user@example.com', active: true },
        { id: 2, name: 'Marketing Node', email: 'marketing@geo-suite.ai', active: false },
    ])
    const [switching, setSwitching] = useState(null)

    const handleSwitch = (id) => {
        setSwitching(id)
        setTimeout(() => {
            setAccounts(prev => prev.map(acc => ({
                ...acc,
                active: acc.id === id
            })))
            setSwitching(null)
        }, 1200)
    }

    const handleAddAccount = () => {
        const newId = accounts.length + 1
        setAccounts([...accounts, { 
            id: newId, 
            name: `Partner Account ${newId}`, 
            email: `partner${newId}@geo-suite.ai`, 
            active: false 
        }])
    }

    return (
        <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Connected Workspaces</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>Switch between different brand accounts and administrative nodes.</p>
                </div>
                <button 
                    onClick={handleAddAccount}
                    className="btn btn-outline" 
                    style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <UserPlus size={16} /> Link Account
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {accounts.map(account => (
                    <div key={account.id} className="account-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '10px', 
                                background: account.active ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: account.active ? 'white' : 'var(--text-tertiary)'
                            }}>
                                <User size={20} />
                            </div>
                            <div>
                                <div style={{ fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {account.name}
                                    {account.active && <span className="account-badge account-badge-primary">Current</span>}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{account.email}</div>
                            </div>
                        </div>

                        {account.active ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: '700', fontSize: '0.85rem' }}>
                                <Check size={16} /> Active Session
                            </div>
                        ) : (
                            <button 
                                onClick={() => handleSwitch(account.id)}
                                disabled={switching !== null}
                                className="btn btn-outline" 
                                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                            >
                                {switching === account.id ? 'Switching...' : 'Switch Here'}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

function PlanCard() {
    return (
        <div className="glass-card" style={{ padding: '1.5rem 2rem', border: '1px solid rgba(167, 139, 250, 0.2)', background: 'rgba(124, 58, 237, 0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(167, 139, 250, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CreditCard color="#a78bfa" size={24} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>Enterprise Pro</span>
                            <span style={{ background: '#a78bfa', color: '#1e1b4b', fontSize: '0.65rem', fontWeight: '900', padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase' }}>Active</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>Your subscription renews on May 12, 2026.</p>
                    </div>
                </div>
                <button className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.6rem 1.25rem', borderRadius: '8px' }}>
                    Manage Billing
                </button>
            </div>
        </div>
    )
}

function PreferencesCard() {
    const [defaultDomain, setDefaultDomain] = useState(() => localStorage.getItem('geo_default_domain') || 'general')
    const [saved, setSaved] = useState(false)

    const handleDomainChange = (domain) => {
        setDefaultDomain(domain)
        localStorage.setItem('geo_default_domain', domain)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    const niches = [
        { id: 'general', label: 'General / Blog', icon: <Globe size={18} /> },
        { id: 'education', label: 'Education', icon: <BookOpen size={18} /> },
        { id: 'ecommerce', label: 'E-commerce', icon: <ShoppingCart size={18} /> }
    ]

    return (
        <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Default Content Niche</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>Set your primary industry to tailor the Discovery and Analysis engines.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                {niches.map((niche) => (
                    <button
                        key={niche.id}
                        onClick={() => handleDomainChange(niche.id)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '1.5rem 1rem',
                            background: defaultDomain === niche.id ? 'rgba(66, 212, 255, 0.15)' : 'var(--bg-tertiary)',
                            border: defaultDomain === niche.id ? '1px solid var(--accent-primary)' : '1px solid var(--bg-tertiary)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            color: defaultDomain === niche.id ? 'var(--accent-primary)' : 'var(--text-secondary)'
                        }}
                    >
                        <div style={{ color: defaultDomain === niche.id ? 'var(--accent-primary)' : 'inherit' }}>
                            {niche.icon}
                        </div>
                        <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{niche.label}</span>
                    </button>
                ))}
            </div>

            {saved && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={{ color: '#10b981', marginTop: '1.25rem', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RefreshCw size={14} /> Preference synced successfully
                </motion.div>
            )}
        </div>
    )
}

function ThemeCard() {
    const { theme, setTheme } = useTheme()

    return (
        <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Interface Theme</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>Switch between dark and light modes for optimal readability.</p>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem' }}>
                <button
                    onClick={() => setTheme('dark')}
                    style={{
                        flex: 1,
                        background: theme === 'dark' ? 'rgba(66, 212, 255, 0.15)' : 'var(--bg-tertiary)',
                        border: theme === 'dark' ? '1px solid var(--accent-primary)' : '1px solid var(--bg-tertiary)',
                        padding: '1.25rem',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: theme === 'dark' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Moon size={20} />
                        <span style={{ fontWeight: '700' }}>Dark Mode</span>
                    </div>
                    {theme === 'dark' && <div style={{ width: '8px', height: '8px', background: 'var(--accent-primary)', borderRadius: '50%' }} />}
                </button>
                <button
                    onClick={() => setTheme('light')}
                    style={{
                        flex: 1,
                        background: theme === 'light' ? 'rgba(66, 212, 255, 0.15)' : 'var(--bg-tertiary)',
                        border: theme === 'light' ? '1px solid var(--accent-primary)' : '1px solid var(--bg-tertiary)',
                        padding: '1.25rem',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: theme === 'light' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Sun size={20} />
                        <span style={{ fontWeight: '700' }}>Light Mode</span>
                    </div>
                    {theme === 'light' && <div style={{ width: '8px', height: '8px', background: 'var(--accent-primary)', borderRadius: '50%' }} />}
                </button>
            </div>
        </div>
    )
}

function DataCard() {
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
        <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--error)' }}>
                <AlertTriangle size={20} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Administrative Danger Zone</h3>
            </div>

            {message && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    borderRadius: '8px',
                    background: message.startsWith('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: message.startsWith('Error') ? 'var(--error)' : 'var(--success)',
                    border: `1px solid ${message.startsWith('Error') ? 'var(--error)' : 'var(--success)'}`,
                    fontSize: '0.9rem',
                    fontWeight: '600'
                }}>
                    {message}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                        <div style={{ fontWeight: '700', marginBottom: '0.25rem' }}>Clear Analytics History</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Irreversibly remove all generated content and citation reports.</div>
                    </div>
                    <button
                        onClick={() => handleAction('Clear History', '/api/history')}
                        disabled={loading}
                        className="btn btn-outline"
                        style={{ color: 'var(--error)', borderColor: 'rgba(239,68,68,0.2)', fontSize: '0.85rem' }}
                    >
                        {loading ? 'Executing...' : 'Clear Data'}
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                        <div style={{ fontWeight: '700', marginBottom: '0.25rem' }}>Purge All Projects</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Delete all project containers, settings, and associations.</div>
                    </div>
                    <button
                        onClick={() => handleAction('Delete Projects', '/api/projects')}
                        disabled={loading}
                        className="btn btn-outline"
                        style={{ color: 'var(--error)', borderColor: 'rgba(239,68,68,0.2)', fontSize: '0.85rem' }}
                    >
                        {loading ? 'Executing...' : 'Purge Projects'}
                    </button>
                </div>

                <div style={{
                    background: 'rgba(239, 68, 68, 0.05)',
                    border: '1px solid rgba(239, 68, 68, 0.1)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '1rem'
                }}>
                    <div>
                        <div style={{ fontWeight: '800', marginBottom: '0.25rem', color: 'var(--error)' }}>Factory Workspace Reset</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--error)', opacity: 0.8 }}>Complete wipe of all local data, settings, and account session.</div>
                    </div>
                    <button
                        onClick={() => handleAction('Factory Reset', '/api/reset', 'POST')}
                        disabled={loading}
                        className="btn"
                        style={{ background: 'var(--error)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', fontWeight: '800', fontSize: '0.85rem', borderRadius: '8px' }}
                    >
                        {loading ? 'Resetting...' : 'EXECUTE RESET'}
                    </button>
                </div>
            </div>
        </div>
    )
}
