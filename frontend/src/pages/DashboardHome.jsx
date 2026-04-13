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
                {/* 1:1 Hero Card */}
                <div className="depth-card" style={{
                    background: 'linear-gradient(135deg, rgba(20, 20, 25, 0.7), rgba(10, 10, 15, 0.4))',
                    backdropFilter: 'blur(40px)',
                    padding: '3.5rem 3rem',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '16px',
                    position: 'relative'
                }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0, letterSpacing: '-0.03em' }}>
                        Welcome back, <span style={{ color: 'var(--accent-gold)' }}>Premium Member.</span>
                    </h2>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0.75rem 0 2rem 0', fontWeight: '500' }}>
                        Your premium SEO and GEO optimization platform. Achieve dominance with advanced AI.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/app/optimization" className="btn" style={{ 
                            background: 'rgba(66, 212, 255, 0.15)', 
                            border: '1px solid rgba(66, 212, 255, 0.3)',
                            color: 'var(--accent-primary)', 
                            padding: '0.85rem 2rem',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontWeight: '700',
                            boxShadow: 'inset 0 0 15px rgba(66, 212, 255, 0.1)'
                        }}>
                            <Plus size={18} /> New Optimization
                        </Link>
                        <Link to="/app/visibility" className="btn" style={{ 
                            background: 'rgba(255, 255, 255, 0.03)', 
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: 'white', 
                            padding: '0.85rem 2rem',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontWeight: '700',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <Search size={18} /> New Visibility Analysis
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

            {/* 1:1 Recommended Actions Section */}
            <section className="section-group">
                <div className="section-header" style={{ marginBottom: '1.5rem', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Plus size={18} color="var(--accent-primary)" />
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommended Actions</h2>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                    
                    {/* Action 1: Analyze Authority */}
                    <Link to="/app/visibility" className="depth-card" style={{ textDecoration: 'none', display: 'flex', gap: '1.25rem', alignItems: 'center', padding: '1.75rem', background: 'rgba(20, 20, 25, 0.5)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, rgba(66, 212, 255, 0.1), rgba(147, 51, 234, 0.1))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src="https://img.icons8.com/isometric/50/42D4FF/shield.png" style={{ width: '32px', height: '32px' }} alt="Shield" />
                        </div>
                        <div>
                            <div style={{ fontWeight: '900', fontSize: '1.15rem', color: 'white', marginBottom: '0.2rem' }}>Analyze Authority</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Check AI engines trust your current domain.</div>
                        </div>
                    </Link>

                    {/* Action 2: Optimize Content */}
                    <Link to="/app/optimization" className="depth-card" style={{ textDecoration: 'none', display: 'flex', gap: '1.25rem', alignItems: 'center', padding: '1.75rem', background: 'rgba(20, 20, 25, 0.5)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(66, 212, 255, 0.1))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src="https://img.icons8.com/isometric/50/9333EA/edit.png" style={{ width: '32px', height: '32px' }} alt="Pencil" />
                        </div>
                        <div>
                            <div style={{ fontWeight: '900', fontSize: '1.15rem', color: 'white', marginBottom: '0.2rem' }}>Optimize Content</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Rewrite articles for maximum citation probability.</div>
                        </div>
                    </Link>

                    {/* Action 3: AI Simulator */}
                    <Link to="/app/ai-simulator" className="depth-card" style={{ textDecoration: 'none', display: 'flex', gap: '1.25rem', alignItems: 'center', padding: '1.75rem', background: 'rgba(20, 20, 25, 0.5)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ width: '56px', height: '56px', background: 'rgba(66, 212, 255, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src="https://img.icons8.com/isometric/50/42D4FF/bot.png" style={{ width: '34px', height: '34px' }} alt="Bot" />
                        </div>
                        <div>
                            <div style={{ fontWeight: '900', fontSize: '1.15rem', color: 'white', marginBottom: '0.2rem' }}>AI Simulator</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Simulate Perplexity or Gemini search results.</div>
                        </div>
                    </Link>

                    {/* Action 4: Citation Tracking */}
                    <Link to="/app/citations" className="depth-card" style={{ textDecoration: 'none', display: 'flex', gap: '1.25rem', alignItems: 'center', padding: '1.75rem', background: 'rgba(20, 20, 25, 0.5)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ width: '56px', height: '56px', background: 'rgba(147, 51, 234, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src="https://img.icons8.com/isometric/50/9333EA/workflow.png" style={{ width: '32px', height: '32px' }} alt="Network" />
                        </div>
                        <div>
                            <div style={{ fontWeight: '900', fontSize: '1.15rem', color: 'white', marginBottom: '0.2rem' }}>Citation Tracking</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Check simulations on network networks.</div>
                        </div>
                    </Link>
                </div>
            </section>
        </div>
    )
}

export default DashboardHome
