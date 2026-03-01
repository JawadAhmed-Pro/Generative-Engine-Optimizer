import { useState, useEffect } from 'react'
import { BarChart2, Plus, Trash2, RefreshCw, TrendingUp, TrendingDown, Minus, AlertTriangle, Trophy, Zap, Clock } from 'lucide-react'
import axios from 'axios'

function CompetitorAnalysis() {
    const [userUrl, setUserUrl] = useState('')
    const [competitorUrls, setCompetitorUrls] = useState([''])
    const [contentType, setContentType] = useState('general')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState(null)
    const [history, setHistory] = useState([])
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            const response = await axios.get('/api/competitor-history?limit=10')
            setHistory(response.data.items || [])
        } catch (err) {
            console.error('Failed to fetch comparison history:', err)
        }
    }

    const addCompetitor = () => {
        if (competitorUrls.length < 5) {
            setCompetitorUrls([...competitorUrls, ''])
        }
    }

    const removeCompetitor = (index) => {
        setCompetitorUrls(competitorUrls.filter((_, i) => i !== index))
    }

    const updateCompetitor = (index, value) => {
        const updated = [...competitorUrls]
        updated[index] = value
        setCompetitorUrls(updated)
    }

    const handleCompare = async () => {
        if (!userUrl.trim()) return
        const validCompetitors = competitorUrls.filter(u => u.trim())
        if (validCompetitors.length === 0) return

        setLoading(true)
        setError(null)
        setResults(null)

        try {
            const response = await axios.post('/api/competitor-compare', {
                user_url: userUrl.trim(),
                competitor_urls: validCompetitors,
                content_type: contentType
            })
            setResults(response.data)
            fetchHistory()
        } catch (err) {
            setError(err.response?.data?.detail || 'Competitor analysis failed')
        } finally {
            setLoading(false)
        }
    }

    const loadHistoricalResult = async (comparisonId) => {
        try {
            setLoading(true)
            const response = await axios.get(`/api/competitor-compare/${comparisonId}`)
            setResults(response.data)
        } catch (err) {
            setError('Failed to load comparison')
        } finally {
            setLoading(false)
        }
    }

    const getScoreColor = (score) => {
        if (score >= 75) return '#10b981'
        if (score >= 50) return '#f59e0b'
        return '#ef4444'
    }

    const getDiffIcon = (diff) => {
        if (diff > 5) return <TrendingUp size={16} color="#10b981" />
        if (diff < -5) return <TrendingDown size={16} color="#ef4444" />
        return <Minus size={16} color="#6b7280" />
    }

    return (
        <div className="animate-fade-in">
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                ⚔️ Competitor Analysis
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Compare your GEO scores against competitors — find gaps and quick wins
            </p>

            {/* Input Section */}
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                        Your URL *
                    </label>
                    <input
                        type="text"
                        value={userUrl}
                        onChange={(e) => setUserUrl(e.target.value)}
                        placeholder="https://your-website.com/page"
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            background: 'var(--bg-primary)',
                            border: '1px solid rgba(99,102,241,0.3)',
                            borderRadius: 'var(--radius-md)',
                            color: 'white',
                            fontSize: '0.95rem',
                            outline: 'none'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Competitor URLs (up to 5)
                        </label>
                        <button
                            onClick={addCompetitor}
                            disabled={competitorUrls.length >= 5}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: competitorUrls.length >= 5 ? 'var(--text-tertiary)' : 'var(--accent-primary)',
                                cursor: competitorUrls.length >= 5 ? 'default' : 'pointer',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                            }}
                        >
                            <Plus size={16} /> Add Competitor
                        </button>
                    </div>
                    {competitorUrls.map((url, index) => (
                        <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => updateCompetitor(index, e.target.value)}
                                placeholder={`https://competitor-${index + 1}.com/page`}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem 1rem',
                                    background: 'var(--bg-primary)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'white',
                                    fontSize: '0.95rem',
                                    outline: 'none'
                                }}
                            />
                            {competitorUrls.length > 1 && (
                                <button
                                    onClick={() => removeCompetitor(index)}
                                    style={{
                                        background: 'rgba(239,68,68,0.1)',
                                        border: 'none',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        padding: '0.5rem',
                                        borderRadius: 'var(--radius-md)',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Content Type</label>
                        <select
                            value={contentType}
                            onChange={(e) => setContentType(e.target.value)}
                            style={{
                                padding: '0.75rem 1rem',
                                background: 'var(--bg-primary)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius-md)',
                                color: 'white',
                                fontSize: '0.95rem',
                                outline: 'none'
                            }}
                        >
                            <option value="general">General</option>
                            <option value="ecommerce">E-Commerce</option>
                            <option value="educational">Educational</option>
                        </select>
                    </div>
                    <button
                        onClick={handleCompare}
                        disabled={loading || !userUrl.trim() || competitorUrls.filter(u => u.trim()).length === 0}
                        className="btn btn-primary"
                        style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
                    >
                        {loading ? (
                            <><RefreshCw size={18} className="spin" style={{ marginRight: '0.5rem' }} /> Analyzing...</>
                        ) : (
                            <><BarChart2 size={18} style={{ marginRight: '0.5rem' }} /> Compare</>
                        )}
                    </button>
                </div>

                {error && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: '#ef4444' }}>
                        {error}
                    </div>
                )}
            </div>

            {/* Results */}
            {results && results.comparison && (
                <div className="animate-fade-in">
                    {/* Position Banner */}
                    <div className="glass-card" style={{
                        padding: '2rem',
                        marginBottom: '1.5rem',
                        background: results.comparison.position === 'ahead'
                            ? 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.02) 100%)'
                            : 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.02) 100%)',
                        borderLeft: `4px solid ${results.comparison.position === 'ahead' ? '#10b981' : '#ef4444'}`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                                    {results.comparison.position === 'ahead' ? '🏆 You\'re Ahead!' : '📈 Room to Grow'}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    Your score: <strong style={{ color: getScoreColor(results.comparison.your_overall) }}>{results.comparison.your_overall}</strong>
                                    {' vs '}
                                    Competitor avg: <strong>{results.comparison.competitor_avg_overall}</strong>
                                    {' '}
                                    ({results.comparison.score_difference > 0 ? '+' : ''}{results.comparison.score_difference} pts)
                                </p>
                            </div>
                            <div style={{ fontSize: '3rem' }}>
                                {results.comparison.position === 'ahead' ? '🏆' : '🎯'}
                            </div>
                        </div>
                    </div>

                    {/* Score Comparison Table */}
                    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>📊 Score Comparison</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>PAGE</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>OVERALL</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>VISIBILITY</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>CITATION</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>SEMANTIC</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>READABILITY</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* User Row */}
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(99,102,241,0.05)' }}>
                                        <td style={{ padding: '0.75rem' }}>
                                            <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                ⭐ {results.user?.title?.substring(0, 30) || 'Your Page'}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{results.user?.url?.substring(0, 40)}</div>
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '700', color: getScoreColor(results.user?.scores?.overall || 0) }}>
                                            {results.user?.scores?.overall || 0}
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center', color: getScoreColor(results.user?.scores?.ai_visibility || 0) }}>
                                            {results.user?.scores?.ai_visibility?.toFixed(1) || 0}
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center', color: getScoreColor(results.user?.scores?.citation_worthiness || 0) }}>
                                            {results.user?.scores?.citation_worthiness?.toFixed(1) || 0}
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center', color: getScoreColor(results.user?.scores?.semantic_coverage || 0) }}>
                                            {results.user?.scores?.semantic_coverage?.toFixed(1) || 0}
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center', color: getScoreColor(results.user?.scores?.technical_readability || 0) }}>
                                            {results.user?.scores?.technical_readability?.toFixed(1) || 0}
                                        </td>
                                    </tr>
                                    {/* Competitor Rows */}
                                    {results.competitors?.map((comp, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '0.75rem' }}>
                                                <div style={{ fontWeight: '500' }}>
                                                    {comp.title?.substring(0, 30) || `Competitor ${idx + 1}`}
                                                    {comp.status === 'error' && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}> (Error)</span>}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{comp.url?.substring(0, 40)}</div>
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: getScoreColor(comp.scores?.overall || 0) }}>
                                                {comp.scores?.overall || 0}
                                                {' '}
                                                {getDiffIcon((results.user?.scores?.overall || 0) - (comp.scores?.overall || 0))}
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>{comp.scores?.ai_visibility?.toFixed(1) || 0}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>{comp.scores?.citation_worthiness?.toFixed(1) || 0}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>{comp.scores?.semantic_coverage?.toFixed(1) || 0}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>{comp.scores?.technical_readability?.toFixed(1) || 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Gaps & Quick Wins Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        {/* Gaps */}
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertTriangle size={18} color="#f59e0b" /> Gaps to Address
                            </h3>
                            {results.comparison.gaps?.length > 0 ? results.comparison.gaps.map((gap, idx) => (
                                <div key={idx} style={{
                                    padding: '1rem',
                                    background: 'var(--bg-primary)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '0.5rem',
                                    borderLeft: `3px solid ${gap.priority === 'high' ? '#ef4444' : '#f59e0b'}`
                                }}>
                                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{gap.metric}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        You: <span style={{ color: getScoreColor(gap.your_score) }}>{gap.your_score}</span>
                                        {' → '}
                                        Avg: <span style={{ color: getScoreColor(gap.competitor_avg) }}>{gap.competitor_avg}</span>
                                        {' '}
                                        <span style={{ color: '#ef4444' }}>(-{gap.gap} pts)</span>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>
                                    No significant gaps — you're doing great! 🎉
                                </div>
                            )}
                        </div>

                        {/* Strengths */}
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Trophy size={18} color="#10b981" /> Your Strengths
                            </h3>
                            {results.comparison.strengths?.length > 0 ? results.comparison.strengths.map((s, idx) => (
                                <div key={idx} style={{
                                    padding: '1rem',
                                    background: 'var(--bg-primary)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '0.5rem',
                                    borderLeft: '3px solid #10b981'
                                }}>
                                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{s.metric}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        You: <span style={{ color: '#10b981' }}>{s.your_score}</span>
                                        {' → '}
                                        Avg: {s.competitor_avg}
                                        {' '}
                                        <span style={{ color: '#10b981' }}>(+{s.advantage} pts)</span>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>
                                    Keep optimizing to build advantages!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Wins */}
                    {results.comparison.quick_wins?.length > 0 && (
                        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Zap size={18} color="#f59e0b" /> Quick Wins
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                                {results.comparison.quick_wins.map((win, idx) => (
                                    <div key={idx} style={{
                                        padding: '1rem',
                                        background: 'linear-gradient(135deg, rgba(245,158,11,0.05) 0%, transparent 100%)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid rgba(245,158,11,0.2)'
                                    }}>
                                        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>⚡ {win.area}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                            {win.what_they_do}
                                        </div>
                                        {win.suggestions?.map((sug, i) => (
                                            <div key={i} style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginTop: '0.25rem' }}>
                                                → {sug}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Feature Gaps */}
                    {results.comparison.feature_gaps?.length > 0 && (
                        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>🔧 Feature Gaps</h3>
                            {results.comparison.feature_gaps.map((fg, idx) => (
                                <div key={idx} style={{
                                    padding: '1rem',
                                    background: 'var(--bg-primary)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '0.5rem',
                                    borderLeft: `3px solid ${fg.impact === 'high' ? '#ef4444' : '#f59e0b'}`
                                }}>
                                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{fg.feature}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{fg.message}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginTop: '0.25rem' }}>Fix: {fg.fix}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* History */}
            {history.length > 0 && (
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={20} /> Comparison History
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>YOUR URL</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>COMPETITORS</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>YOUR SCORE</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>COMP AVG</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>DATE</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>{item.user_url?.substring(0, 40)}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.competitor_urls?.length || 0}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: getScoreColor(item.user_overall_score || 0) }}>
                                            {item.user_overall_score?.toFixed(1) || '-'}
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.competitor_avg_score?.toFixed(1) || '-'}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                            <button
                                                onClick={() => loadHistoricalResult(item.id)}
                                                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.85rem' }}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CompetitorAnalysis
