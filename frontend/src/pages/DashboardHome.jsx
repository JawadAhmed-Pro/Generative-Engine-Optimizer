import TrendChart from '../components/TrendChart'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Crown } from 'lucide-react'

// Global cache for dashboard stats to make navigation feel instant
let statsCache = null;

function DashboardHome() {
    const [stats, setStats] = useState(statsCache || {
        avg_score: 0,
        content_optimized: 0,
        urls_analyzed: 0,
        total_projects: 0
    })
    const [loading, setLoading] = useState(!statsCache)
    const { user } = useAuth()
    const { theme, isDark } = useTheme()

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout for dashboard stats

        try {
            const response = await axios.get('/api/stats', {
                signal: controller.signal
            })
            const newStats = {
                avg_score: response.data.avg_score || 0,
                content_optimized: response.data.content_optimized || 0,
                urls_analyzed: response.data.urls_analyzed || 0,
                total_projects: response.data.total_projects || 0
            };
            statsCache = newStats;
            setStats(newStats)
        } catch (error) {
            if (axios.isCancel(error)) {
                console.warn('Stats fetch timed out');
            } else {
                console.error('Failed to fetch stats:', error)
            }
        } finally {
            clearTimeout(timeoutId);
            setLoading(false)
        }
    }

    const getScoreColor = (score) => {
        if (score >= 80) return 'var(--success)'
        if (score >= 60) return 'var(--warning)'
        return 'var(--error)'
    }

    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excellent'
        if (score >= 60) return 'Good'
        if (score >= 40) return 'Needs Improvement'
        return 'Getting Started'
    }

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.25rem', letterSpacing: '-0.04em' }}>
                    Dashboard
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    Overview of your GEO performance
                </p>
            </div>

            <div className="section-group" style={{ paddingTop: 0 }}>
                {/* Executive Hero Section */}
                <div className="depth-card" style={{
                    background: isDark ? 'rgba(15, 15, 20, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(40px)',
                    padding: '3.5rem 2.5rem',
                    border: isDark ? '1px solid rgba(248, 250, 252, 0.08)' : '1px solid rgba(15, 23, 42, 0.08)',
                    borderRadius: '20px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 20px 40px -10px rgba(15, 23, 42, 0.05)'
                }}>
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.75rem', 
                            color: isDark ? '#94A3B8' : '#B59410', 
                            fontSize: '0.9rem', 
                            fontWeight: '800', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.15em' 
                        }}>
                             <Crown size={18} /> Premium Tier Account
                        </div>
                        
                        <h2 style={{ 
                            fontSize: '2.5rem', 
                            fontWeight: '900', 
                            margin: 0, 
                            letterSpacing: '-0.04em',
                            color: isDark ? 'white' : '#0F172A' 
                        }}>
                            Welcome back, {isDark ? <span style={{ color: '#94A3B8' }}>{user?.name || 'Creator'}</span> : <span style={{ color: '#0F172A' }}>{user?.name || 'Creator'}</span>}.
                        </h2>
                        
                        <p style={{ 
                            fontSize: '1.2rem', 
                            color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15, 23, 42, 0.6)', 
                            maxWidth: '700px', 
                            lineHeight: '1.6', 
                            margin: 0,
                            fontFamily: 'Inter, sans-serif'
                        }}>
                            Your executive SEO platform is active. Scale your domain authority and citation probability with our advanced GEO engine.
                        </p>

                        <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1.5rem' }}>
                            <Link to="/app/optimization" className="btn" style={{ 
                                background: isDark ? '#F8FAFC' : '#0F172A', 
                                color: isDark ? '#0F172A' : 'white', 
                                padding: '1rem 2.25rem',
                                borderRadius: '8px',
                                fontWeight: '700',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                transition: 'transform 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                Start Optimization
                            </Link>
                            <Link to="/app/visibility" className="btn" style={{ 
                                background: 'transparent', 
                                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(15, 23, 42, 0.1)',
                                color: isDark ? 'white' : '#0F172A', 
                                padding: '1rem 2.25rem',
                                borderRadius: '8px',
                                fontWeight: '700'
                            }}>
                                New Visibility Audit
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Overview Section */}
            <section className="section-group">
                <div className="section-header" style={{ marginBottom: '2rem' }}>
                    <BarChart2 size={24} color={isDark ? '#94A3B8' : '#0F172A'} />
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15, 23, 42, 0.5)' }}>Executive Overview</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {loading ? (
                        <>
                            <div className="skeleton skeleton-card" style={{ height: '180px' }}></div>
                            <div className="skeleton skeleton-card" style={{ height: '180px' }}></div>
                            <div className="skeleton skeleton-card" style={{ height: '180px' }}></div>
                        </>
                    ) : (
                        <>
                            {/* Stat Card 1 - GEO Score */}
                            <div className="depth-card" style={{ 
                                padding: '2rem', 
                                border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)', 
                                borderRadius: '16px', 
                                background: isDark ? 'rgba(255,255,255,0.02)' : 'white',
                                boxShadow: isDark ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)' 
                            }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(15, 23, 42, 0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    AVG. GEO SCORE <Info size={14} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div>
                                        <div style={{ fontSize: '3.5rem', fontWeight: '900', letterSpacing: '-0.04em', color: isDark ? 'white' : '#0F172A' }}>{stats.avg_score.toFixed(1)}</div>
                                        <div style={{ color: '#10b981', fontWeight: '800', fontSize: '0.9rem', marginTop: '0.5rem' }}>{getScoreLabel(stats.avg_score)}</div>
                                    </div>
                                    <div style={{ width: '120px', height: '40px', background: `url("data:image/svg+xml,%3Csvg width='120' height='40' viewBox='0 0 100 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30L20 25L40 32L60 15L80 20L100 5' stroke='${isDark ? '%2394A3B8' : '%231E293B'}' stroke-width='2'/%3E%3C/svg%3E") no-repeat center`, opacity: 0.4 }} />
                                </div>
                            </div>

                            {/* Stat Card 2 - Content Optimized */}
                            <div className="depth-card" style={{ 
                                padding: '2rem', 
                                border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)', 
                                borderRadius: '16px', 
                                background: isDark ? 'rgba(255,255,255,0.02)' : 'white',
                                boxShadow: isDark ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)' 
                            }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(15, 23, 42, 0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.5rem' }}>
                                    CONTENT OPTIMIZED
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '3.5rem', fontWeight: '900', color: isDark ? 'white' : '#0F172A' }}>{stats.content_optimized}</div>
                                        <div style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15, 23, 42, 0.5)', fontSize: '0.9rem' }}>High-fidelity assets</div>
                                    </div>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '4px solid rgba(0,0,0,0.05)', borderTopColor: isDark ? '#94A3B8' : '#1E293B', transform: 'rotate(25deg)' }} />
                                </div>
                            </div>

                            {/* Stat Card 3 - URLs Analyzed */}
                            <div className="depth-card" style={{ 
                                padding: '2rem', 
                                border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)', 
                                borderRadius: '16px', 
                                background: isDark ? 'rgba(255,255,255,0.02)' : 'white',
                                boxShadow: isDark ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)' 
                            }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(15, 23, 42, 0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.5rem' }}>
                                    SEARCH FOOTPRINT
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div>
                                        <div style={{ fontSize: '3.5rem', fontWeight: '900', color: isDark ? 'white' : '#0F172A' }}>{stats.urls_analyzed}+</div>
                                        <div style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15, 23, 42, 0.5)', fontSize: '0.9rem' }}>Analyzed Nodes</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', height: '40px', alignItems: 'flex-end' }}>
                                        {[20, 60, 40, 80, 50].map((h, i) => (
                                            <div key={i} style={{ width: '8px', height: `${h}%`, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15, 23, 42, 0.1)', borderRadius: '2px' }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Optimization Trends Section */}
            <section className="section-group">
                <div className="section-header">
                    <Zap size={24} color="var(--accent-secondary)" />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Optimization Trends</h2>
                </div>
                <div className="depth-card" style={{ padding: '1.5rem' }}>
                    <TrendChart limit={10} />
                </div>
            </section>

            {/* Quick Actions Section */}
            <section className="section-group">
                <div className="section-header" style={{ marginBottom: '2rem' }}>
                    <Plus size={20} color={isDark ? '#94A3B8' : '#0F172A'} />
                    <h2 style={{ fontSize: '1rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15, 23, 42, 0.5)' }}>Recommended Actions</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    
                    <Link to="/app/visibility" className="depth-card" style={{ textDecoration: 'none', display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.75rem', border: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', background: isDark ? 'rgba(15,23,42,0.3)' : 'white', transition: 'all 0.3s ease' }}>
                        <div style={{ width: '56px', height: '56px', background: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(15, 23, 42, 0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyItems: 'center', padding: '12px', color: isDark ? '#94A3B8' : '#1E293B' }}>
                             <Search size={32} />
                        </div>
                        <div>
                            <div style={{ fontWeight: '800', fontSize: '1.25rem', marginBottom: '0.25rem', color: isDark ? 'white' : '#0F172A' }}>Analyze Authority</div>
                            <div style={{ fontSize: '0.9rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15, 23, 42, 0.5)', lineHeight: '1.4' }}>Audit your AI-engine trust signals.</div>
                        </div>
                    </Link>

                    <Link to="/app/optimization" className="depth-card" style={{ textDecoration: 'none', display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.75rem', border: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', background: isDark ? 'rgba(15,23,42,0.3)' : 'white', transition: 'all 0.3s ease' }}>
                        <div style={{ width: '56px', height: '56px', background: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(15, 23, 42, 0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyItems: 'center', padding: '12px', color: isDark ? '#94A3B8' : '#1E293B' }}>
                             <Zap size={32} />
                        </div>
                        <div>
                            <div style={{ fontWeight: '800', fontSize: '1.25rem', marginBottom: '0.25rem', color: isDark ? 'white' : '#0F172A' }}>Optimize Content</div>
                            <div style={{ fontSize: '0.9rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15, 23, 42, 0.5)', lineHeight: '1.4' }}>Rewrite assets for max citation probability.</div>
                        </div>
                    </Link>

                    <Link to="/app/ai-simulator" className="depth-card" style={{ textDecoration: 'none', display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.75rem', border: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', background: isDark ? 'rgba(15,23,42,0.3)' : 'white', transition: 'all 0.3s ease' }}>
                        <div style={{ width: '56px', height: '56px', background: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(15, 23, 42, 0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyItems: 'center', padding: '12px', color: isDark ? '#94A3B8' : '#1E293B' }}>
                             <Search size={32} />
                        </div>
                        <div>
                            <div style={{ fontWeight: '800', fontSize: '1.25rem', marginBottom: '0.25rem', color: isDark ? 'white' : '#0F172A' }}>Market Intelligence</div>
                            <div style={{ fontSize: '0.9rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15, 23, 42, 0.5)', lineHeight: '1.4' }}>Simulate and track competitor signals.</div>
                        </div>
                    </Link>
                </div>
            </section>
        </div>
    )
}

export default DashboardHome
