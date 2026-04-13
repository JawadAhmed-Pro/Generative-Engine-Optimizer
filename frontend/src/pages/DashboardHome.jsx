import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, BarChart2, Search, Zap, Folder, Info } from 'lucide-react'
import axios from 'axios'
import TrendChart from '../components/TrendChart'
import { useAuth } from '../context/AuthContext'

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
                {/* Hero / Welcome Card */}
                <div className="depth-card" style={{
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(30px)',
                    padding: '3rem 2.5rem',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    {/* Abstract Blue/Purple Glow Background */}
                    <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '60%', height: '200%', background: 'radial-gradient(circle, rgba(0, 210, 255, 0.1) 0%, rgba(112, 0, 255, 0.05) 50%, transparent 100%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
                    
                    <h2 style={{ fontSize: '2.25rem', fontWeight: '900', margin: 0, letterSpacing: '-0.03em' }}>
                        Welcome back, <span style={{ background: 'linear-gradient(to right, #00d2ff, #7000ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Premium Member.</span>
                    </h2>
                    <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', maxWidth: '600px', lineHeight: '1.6', margin: 0 }}>
                        Your premium SEO and GEO optimization platform. Achieve dominance with advanced AI.
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
                        <Link to="/app/optimization" className="btn" style={{ 
                            background: 'rgba(59, 130, 246, 0.2)', 
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            color: '#60a5fa', 
                            padding: '1rem 2rem',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontWeight: '700',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.2)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.1)'; }}
                        >
                            <Plus size={20} /> New Optimization
                        </Link>
                        <Link to="/app/visibility" className="btn" style={{ 
                            background: 'rgba(255, 255, 255, 0.03)', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white', 
                            padding: '1rem 2rem',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontWeight: '700'
                        }}>
                            <Search size={20} /> New Visibility Analysis
                        </Link>
                    </div>
                </div>
            </div>

            {/* Performance Overview Section */}
            <section className="section-group">
                <div className="section-header" style={{ marginBottom: '1.5rem' }}>
                    <BarChart2 size={24} color="#00d2ff" />
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)' }}>Performance Overview</h2>
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
                            {/* Stat Card 1 - GEO Score with Sparkline */}
                            <div className="depth-card" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', position: 'relative' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    AVG. GEO SCORE <Info size={14} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div>
                                        <div style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-0.02em' }}>{stats.avg_score.toFixed(1)}</div>
                                        <div style={{ color: '#10b981', fontWeight: '800', fontSize: '0.9rem', marginTop: '0.5rem' }}>{getScoreLabel(stats.avg_score)}</div>
                                    </div>
                                    {/* Mock Sparkline Graph */}
                                    <div style={{ width: '100px', height: '40px', background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'40\' viewBox=\'0 0 100 40\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 30L20 25L40 32L60 15L80 20L100 5\' stroke=\'%2300D2FF\' stroke-width=\'2\'/%3E%3C/svg%3E") no-repeat center', opacity: 0.6 }} />
                                </div>
                            </div>

                            {/* Stat Card 2 - Content Optimized with Circle Progress */}
                            <div className="depth-card" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>
                                    CONTENT OPTIMIZED
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '3rem', fontWeight: '900' }}>{stats.content_optimized}</div>
                                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>High-visibility articles</div>
                                    </div>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '6px solid rgba(255,255,255,0.05)', borderTopColor: '#00d2ff', transform: 'rotate(45deg)' }} />
                                </div>
                            </div>

                            {/* Stat Card 3 - URLs Analyzed with Mini Bars */}
                            <div className="depth-card" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>
                                    URLS ANALYZED
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div>
                                        <div style={{ fontSize: '3rem', fontWeight: '900' }}>{stats.urls_analyzed}+</div>
                                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Active Assessments</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px', height: '40px', alignItems: 'flex-end' }}>
                                        {[20, 40, 30, 60, 45, 70, 55].map((h, i) => (
                                            <div key={i} style={{ width: '6px', height: `${h}%`, background: h > 50 ? '#00d2ff' : 'rgba(255,255,255,0.2)', borderRadius: '10px' }} />
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
                <div className="section-header" style={{ marginBottom: '1.5rem' }}>
                    <Plus size={20} color="#00d2ff" />
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)' }}>Recommended Actions</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    
                    <Link to="/app/visibility" className="depth-card" style={{ textDecoration: 'none', display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '18px', background: 'rgba(15,23,42,0.3)', transition: 'all 0.3s ease' }}>
                        <div style={{ width: '60px', height: '60px', background: 'rgba(0, 210, 255, 0.1)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', boxShadow: '0 0 20px rgba(0, 210, 255, 0.1)', border: '1px solid rgba(0, 210, 255, 0.15)' }}>
                            <img src="https://img.icons8.com/isometric/50/00D2FF/shield.png" style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Authority" />
                        </div>
                        <div>
                            <div style={{ fontWeight: '800', fontSize: '1.2rem', marginBottom: '0.25rem', color: 'white' }}>Analyze Authority</div>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.4' }}>Check AI engines trust your current domain.</div>
                        </div>
                    </Link>

                    <Link to="/app/optimization" className="depth-card" style={{ textDecoration: 'none', display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '18px', background: 'rgba(15,23,42,0.3)', transition: 'all 0.3s ease' }}>
                        <div style={{ width: '60px', height: '60px', background: 'rgba(112, 0, 255, 0.1)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', boxShadow: '0 0 20px rgba(112, 0, 255, 0.1)', border: '1px solid rgba(112, 0, 255, 0.15)' }}>
                            <img src="https://img.icons8.com/isometric/50/7000FF/rocket.png" style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Optimize" />
                        </div>
                        <div>
                            <div style={{ fontWeight: '800', fontSize: '1.2rem', marginBottom: '0.25rem', color: 'white' }}>Optimize Content</div>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.4' }}>Rewrite articles for maximum citation probability.</div>
                        </div>
                    </Link>

                    <Link to="/app/ai-simulator" className="depth-card" style={{ textDecoration: 'none', display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '18px', background: 'rgba(15,23,42,0.3)', transition: 'all 0.3s ease' }}>
                        <div style={{ width: '60px', height: '60px', background: 'rgba(0, 210, 255, 0.1)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', boxShadow: '0 0 20px rgba(0, 210, 255, 0.1)', border: '1px solid rgba(0, 210, 255, 0.15)' }}>
                            <img src="https://img.icons8.com/isometric/50/00D2FF/bot.png" style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Simulator" />
                        </div>
                        <div>
                            <div style={{ fontWeight: '800', fontSize: '1.2rem', marginBottom: '0.25rem', color: 'white' }}>AI Simulator</div>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.4' }}>Simulate Perplexity or Gemini search results.</div>
                        </div>
                    </Link>
                </div>
            </section>
        </div>
    )
}

export default DashboardHome
