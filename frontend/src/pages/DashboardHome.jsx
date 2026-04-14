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

    // Static Visual Gauges for Premium Dashboard (Mockup-Inspired)
    const VisualMetricGauge = ({ value, max, type, color }) => {
        const percentage = Math.min((value / max) * 100, 100);

        switch (type) {
            case 'score': // Sparkline (Card 1 style)
                return (
                    <div style={{ width: '60px', height: '24px', opacity: 0.8 }}>
                        <svg width="60" height="24" viewBox="0 0 60 24">
                            <path
                                d="M0 18 Q15 22 20 14 T40 10 T60 4"
                                fill="none"
                                stroke={color}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
                            />
                        </svg>
                    </div>
                );
            case 'optimized': // Refined Circular Gauge (Card 2 style)
                const radius = 12;
                const circumference = 2 * Math.PI * radius;
                const offset = circumference - (percentage / 100) * circumference;
                return (
                    <div style={{ position: 'relative', width: '32px', height: '32px' }}>
                        <svg width="32" height="32" viewBox="0 0 32 32">
                            <circle cx="16" cy="16" r={radius} fill="none" stroke="var(--bg-tertiary)" strokeWidth="4" />
                            <circle
                                cx="16" cy="16" r={radius} fill="none" stroke={color}
                                strokeWidth="4" strokeDasharray={circumference}
                                strokeDashoffset={offset} strokeLinecap="round"
                                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                            />
                        </svg>
                    </div>
                );
            case 'analyzed': // Rhythmic Bar Cluster (Card 3 style)
                return (
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '22px' }}>
                        {[0.4, 0.7, 0.5, 0.9, 0.6, 1.0].map((h, i) => (
                            <div key={i} style={{
                                width: '4px',
                                height: `${h * 100}%`,
                                background: color,
                                borderRadius: '1px',
                                opacity: 0.3 + (h * 0.7)
                            }}></div>
                        ))}
                    </div>
                );
            case 'projects': // Solid Beacon
                return (
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: color, transform: 'rotate(45deg)', boxShadow: `0 0 12px ${color}40` }}></div>
                );
            default:
                return null;
        }
    };

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
                <div className="glass-card" style={{
                    background: '#0d111a',
                    padding: '2.5rem 2rem',
                    border: '1px solid var(--card-border)',
                    boxShadow: 'var(--elevation-high)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Interior Glow */}
                    <div style={{
                        position: 'absolute',
                        top: '-20%',
                        right: '-10%',
                        width: '40%',
                        height: '140%',
                        background: 'radial-gradient(circle, var(--interior-decor-glow) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                        pointerEvents: 'none'
                    }}></div>

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
                            Welcome back, <span className="text-gradient">{user?.name || 'Creator'} !</span>
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', marginBottom: '1.5rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                            Your SEO is now AI-Driven. Track your authority, optimize for citation probability, and outpace the competition on the next generation of search engines.
                        </p>
                        <div style={{ display: 'flex', gap: '1.25rem' }}>
                            <Link to="/app/optimization" className="btn btn-premium-blue" style={{ padding: '0.875rem 2rem' }}>
                                <Plus size={20} /> New Optimization
                            </Link>
                            <Link to="/app/visibility" className="btn btn-premium-blue" style={{ padding: '0.875rem 2rem' }}>
                                <Search size={20} /> New Visibility Analysis
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Overview Section */}
            <section className="section-group">
                <div className="section-header">
                    <BarChart2 size={24} color="var(--accent-primary)" />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Performance Overview</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                    {loading ? (
                        <>
                            <div className="skeleton skeleton-card" style={{ height: '160px' }}></div>
                            <div className="skeleton skeleton-card" style={{ height: '160px' }}></div>
                            <div className="skeleton skeleton-card" style={{ height: '160px' }}></div>
                            <div className="skeleton skeleton-card" style={{ height: '160px' }}></div>
                        </>
                    ) : (
                        <>
                            {/* Stat Card 1 */}
                            <div className="depth-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div
                                    className="tooltip"
                                    data-tooltip="The statistical probability that ChatGPT, Gemini, or Perplexity will cite your link."
                                    style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', cursor: 'help', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    AVG. GEO SCORE <Info size={14} color="var(--accent-primary)" />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', width: '100%', minHeight: '40px' }}>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                                        {stats.avg_score.toFixed(1)}
                                    </div>
                                    <VisualMetricGauge value={stats.avg_score} max={10} type="score" color={getScoreColor(stats.avg_score)} />
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    color: getScoreColor(stats.avg_score),
                                    background: 'var(--bg-tertiary)',
                                    border: `1px solid ${getScoreColor(stats.avg_score)}33`,
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '100px',
                                    display: 'inline-block'
                                }}>
                                    {getScoreLabel(stats.avg_score)}
                                </div>
                            </div>

                            {/* Stat Card 2 */}
                            <div className="depth-card">
                                <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                                    CONTENT OPTIMIZED
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', width: '100%', minHeight: '40px' }}>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>
                                        {stats.content_optimized}
                                    </div>
                                    <VisualMetricGauge value={stats.content_optimized} max={100} type="optimized" color="var(--accent-secondary)" />
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    High-visibility articles
                                </div>
                            </div>

                            {/* Stat Card 3 */}
                            <div className="depth-card">
                                <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                                    URLS ANALYZED
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', width: '100%', minHeight: '40px' }}>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>
                                        {stats.urls_analyzed}
                                    </div>
                                    <VisualMetricGauge value={stats.urls_analyzed} max={50} type="analyzed" color="var(--accent-primary)" />
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    GEO assessments
                                </div>
                            </div>

                            {/* Stat Card 4 */}
                            <Link to="/app/projects" style={{ textDecoration: 'none' }} className="depth-card">
                                <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
                                    ACTIVE PROJECTS
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', width: '100%', minHeight: '40px' }}>
                                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                                        {stats.total_projects}
                                    </div>
                                    <VisualMetricGauge value={stats.total_projects} max={10} type="projects" color="var(--accent-primary)" />
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                                    Manage workspaces →
                                </div>
                            </Link>
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
                <div className="section-header">
                    <Plus size={24} color="var(--accent-primary)" />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Recommended Actions</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <Link to="/app/visibility" className="depth-card" style={{ textDecoration: 'none', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--card-border)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-primary)',
                            flexShrink: 0
                        }}>
                            <Search size={32} />
                        </div>
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Analyze Authority</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Check if AI engines trust your current domain.</div>
                        </div>
                    </Link>

                    <Link to="/app/optimization" className="depth-card" style={{ textDecoration: 'none', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--card-border)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-secondary)',
                            flexShrink: 0
                        }}>
                            <Zap size={32} />
                        </div>
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Optimize Content</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rewrite articles for maximum citation probability.</div>
                        </div>
                    </Link>

                    <Link to="/app/ai-simulator" className="depth-card" style={{ textDecoration: 'none', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--card-border)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-tertiary)',
                            flexShrink: 0
                        }}>
                            <FileText size={32} />
                        </div>
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>AI Simulator</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Simulate Perplexity or Gemini search results.</div>
                        </div>
                    </Link>
                </div>
            </section>
        </div>
    )
}

export default DashboardHome
