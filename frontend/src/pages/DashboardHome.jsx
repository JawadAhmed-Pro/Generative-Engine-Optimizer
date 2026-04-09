import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, BarChart2, Search, Zap, Folder } from 'lucide-react'
import axios from 'axios'
import TrendChart from '../components/TrendChart'

function DashboardHome() {
    const [stats, setStats] = useState({
        avg_score: 0,
        content_optimized: 0,
        urls_analyzed: 0,
        total_projects: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/stats')
            setStats({
                avg_score: response.data.avg_score || 0,
                content_optimized: response.data.content_optimized || 0,
                urls_analyzed: response.data.urls_analyzed || 0,
                total_projects: response.data.total_projects || 0
            })
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        } finally {
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
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Overview of your GEO performance</p>

            {/* Welcome Card */}
            <div className="glass-card" style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.7) 100%)',
                marginBottom: '2rem',
                padding: '2.5rem'
            }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1rem' }}>Welcome back, User Account.</h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '2rem' }}>
                    Your Generative Engine Optimizer (GEO) command center is ready. Leverage AI-Driven SEO to track visibility, optimize content, and dominate the search landscape.
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/app/optimization" className="btn btn-primary">
                        <Plus size={18} /> New Optimization
                    </Link>
                    <Link to="/app/visibility" className="btn btn-secondary">
                        <FileText size={18} style={{ marginRight: '0.5rem' }} /> New Analysis
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {loading ? (
                    <>
                        <div className="glass-card skeleton skeleton-card"></div>
                        <div className="glass-card skeleton skeleton-card"></div>
                        <div className="glass-card skeleton skeleton-card"></div>
                    </>
                ) : (
                    <>
                        {/* Stat 1 */}
                        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div 
                                    className="tooltip" 
                                    data-tooltip="The statistical probability that ChatGPT, Gemini, or Perplexity will cite your link as a source for this topic."
                                    style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '0.5rem', cursor: 'help', display: 'inline-block' }}
                                >
                                    AVG. GEO SCORE <span style={{ color: 'var(--accent-primary)', opacity: 0.8 }}>ⓘ</span>
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem' }}>{stats.avg_score.toFixed(1)}</div>
                                <div style={{ fontSize: '0.875rem', color: getScoreColor(stats.avg_score) }}>{getScoreLabel(stats.avg_score)}</div>
                            </div>
                            <BarChart2 size={48} color="var(--text-tertiary)" style={{ opacity: 0.2 }} />
                        </div>

                        {/* Stat 2 */}
                        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>CONTENT OPTIMIZED</div>
                                <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem' }}>{stats.content_optimized}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Articles generated</div>
                            </div>
                            <FileText size={48} color="var(--text-tertiary)" style={{ opacity: 0.2 }} />
                        </div>

                        {/* Stat 3 */}
                        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>URLS ANALYZED</div>
                                <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem' }}>{stats.urls_analyzed}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Visibility checks</div>
                            </div>
                            <Search size={48} color="var(--text-tertiary)" style={{ opacity: 0.2 }} />
                        </div>

                        {/* Stat 4 */}
                        <Link to="/app/projects" style={{ textDecoration: 'none' }}>
                            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>PROJECTS</div>
                                    <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem' }}>{stats.total_projects}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Active workspaces</div>
                                </div>
                                <Folder size={48} color="var(--text-tertiary)" style={{ opacity: 0.2 }} />
                            </div>
                        </Link>
                    </>
                )}
            </div>

            {/* Score Trends */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Score Trends</h3>
                <TrendChart limit={10} />
            </div>

            {/* Quick Actions */}
            <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <Link to="/app/visibility" className="glass-card" style={{
                        padding: '1.5rem',
                        textAlign: 'center',
                        textDecoration: 'none',
                        transition: 'all 0.3s'
                    }}>
                        <Search size={32} color="var(--accent-primary)" style={{ marginBottom: '0.75rem' }} />
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Analyze URL</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Check AI visibility</div>
                    </Link>
                    <Link to="/app/optimization" className="glass-card" style={{
                        padding: '1.5rem',
                        textAlign: 'center',
                        textDecoration: 'none',
                        transition: 'all 0.3s'
                    }}>
                        <Zap size={32} color="var(--accent-secondary)" style={{ marginBottom: '0.75rem' }} />
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Optimize Content</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Rewrite for GEO</div>
                    </Link>
                    <Link to="/app/simulator" className="glass-card" style={{
                        padding: '1.5rem',
                        textAlign: 'center',
                        textDecoration: 'none',
                        transition: 'all 0.3s'
                    }}>
                        <BarChart2 size={32} color="var(--success)" style={{ marginBottom: '0.75rem' }} />
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>AI Simulator</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Test citation</div>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default DashboardHome
