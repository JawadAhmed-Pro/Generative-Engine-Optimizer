import { useState, useEffect } from 'react'
import { Globe, Search, TrendingUp, RefreshCw, ChevronDown, ChevronUp, ExternalLink, Clock } from 'lucide-react'
import axios from 'axios'

function CitationTracking() {
    const [domain, setDomain] = useState('')
    const [brandName, setBrandName] = useState('')
    const [niche, setNiche] = useState('technology')
    const [customPrompts, setCustomPrompts] = useState('')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState(null)
    const [history, setHistory] = useState([])
    const [historyLoading, setHistoryLoading] = useState(true)
    const [expandedPlatform, setExpandedPlatform] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            const response = await axios.get('/api/citation-history?limit=10')
            setHistory(response.data.items || [])
        } catch (err) {
            console.error('Failed to fetch citation history:', err)
        } finally {
            setHistoryLoading(false)
        }
    }

    const handleTrack = async () => {
        if (!domain.trim()) return
        setLoading(true)
        setError(null)
        setResults(null)

        try {
            const payload = {
                domain: domain.trim(),
                brand_name: brandName.trim() || null,
                niche: niche
            }

            if (customPrompts.trim()) {
                payload.custom_prompts = customPrompts.split('\n').filter(p => p.trim())
            }

            const response = await axios.post('/api/citation-track', payload)
            setResults(response.data)
            fetchHistory()
        } catch (err) {
            setError(err.response?.data?.detail || 'Citation tracking failed')
        } finally {
            setLoading(false)
        }
    }

    const loadHistoricalResult = async (trackingId) => {
        try {
            setLoading(true)
            const response = await axios.get(`/api/citation-track/${trackingId}`)
            setResults(response.data)
            setDomain(response.data.domain || '')
            setBrandName(response.data.brand_name || '')
        } catch (err) {
            setError('Failed to load historical result')
        } finally {
            setLoading(false)
        }
    }

    const getCitationColor = (rate) => {
        if (rate >= 50) return '#10b981'
        if (rate >= 25) return '#f59e0b'
        return '#ef4444'
    }

    const getSentimentEmoji = (sentiment) => {
        if (sentiment === 'positive') return '😊'
        if (sentiment === 'negative') return '😟'
        return '😐'
    }

    return (
        <div className="animate-fade-in">
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                🔍 Citation Tracking
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Track where your content appears across AI platforms — ChatGPT, Gemini, Perplexity
            </p>

            {/* Input Section */}
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem' }}>Track Your Domain</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                            Domain *
                        </label>
                        <input
                            type="text"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder="example.com"
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                background: 'var(--bg-primary)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius-md)',
                                color: 'white',
                                fontSize: '0.95rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                            Brand Name (optional)
                        </label>
                        <input
                            type="text"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            placeholder="Your Brand"
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                background: 'var(--bg-primary)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius-md)',
                                color: 'white',
                                fontSize: '0.95rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                            Niche / Industry
                        </label>
                        <select
                            value={niche}
                            onChange={(e) => setNiche(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                background: 'var(--bg-primary)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius-md)',
                                color: 'white',
                                fontSize: '0.95rem',
                                outline: 'none'
                            }}
                        >
                            <option value="technology">Technology</option>
                            <option value="ecommerce">E-Commerce</option>
                            <option value="education">Education</option>
                            <option value="health">Health & Wellness</option>
                            <option value="finance">Finance</option>
                            <option value="marketing">Marketing</option>
                            <option value="saas">SaaS</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                            Custom Prompts (one per line, optional)
                        </label>
                        <textarea
                            value={customPrompts}
                            onChange={(e) => setCustomPrompts(e.target.value)}
                            placeholder="What are the best tools for...&#10;Compare top platforms for..."
                            rows={2}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                background: 'var(--bg-primary)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius-md)',
                                color: 'white',
                                fontSize: '0.95rem',
                                outline: 'none',
                                resize: 'vertical'
                            }}
                        />
                    </div>
                </div>

                <button
                    onClick={handleTrack}
                    disabled={loading || !domain.trim()}
                    className="btn btn-primary"
                    style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
                >
                    {loading ? (
                        <><RefreshCw size={18} className="spin" style={{ marginRight: '0.5rem' }} /> Tracking... (this takes ~1 min)</>
                    ) : (
                        <><Search size={18} style={{ marginRight: '0.5rem' }} /> Track Citations</>
                    )}
                </button>

                {error && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: '#ef4444' }}>
                        {error}
                    </div>
                )}
            </div>

            {/* Results */}
            {results && (
                <div className="animate-fade-in">
                    {/* Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>CITATION RATE</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: getCitationColor(results.summary?.overall_citation_rate || 0) }}>
                                {results.summary?.overall_citation_rate || 0}%
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>across all platforms</div>
                        </div>
                        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>TOTAL CITATIONS</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
                                {results.summary?.total_citations || 0}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>mentions found</div>
                        </div>
                        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>PLATFORMS CHECKED</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                                {results.summary?.platforms_checked || 0}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>AI platforms</div>
                        </div>
                        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>PROMPTS TESTED</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                                {results.summary?.prompts_tested || 0}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>queries tested</div>
                        </div>
                    </div>

                    {/* Platform Results */}
                    {results.platforms && Object.entries(results.platforms).map(([key, platform]) => (
                        <div key={key} className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                            <div
                                onClick={() => setExpandedPlatform(expandedPlatform === key ? null : key)}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>
                                        {key === 'perplexity' ? '🔍' : key === 'gemini' ? '✨' : '🤖'}
                                    </span>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{platform.name}</h3>
                                        <span style={{ fontSize: '0.85rem', color: platform.status === 'error' ? '#ef4444' : 'var(--text-secondary)' }}>
                                            {platform.status === 'error' ? `Error: ${platform.error}` : `${platform.total_mentions || 0} citations in ${platform.total_prompts || 0} prompts`}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '2rem',
                                        background: getCitationColor(platform.citation_rate || 0) + '20',
                                        color: getCitationColor(platform.citation_rate || 0),
                                        fontWeight: '700',
                                        fontSize: '0.95rem'
                                    }}>
                                        {platform.citation_rate || 0}%
                                    </div>
                                    {expandedPlatform === key ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {expandedPlatform === key && platform.citations && (
                                <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                                    {platform.citations.map((citation, idx) => (
                                        <div key={idx} style={{
                                            padding: '1rem',
                                            background: 'var(--bg-primary)',
                                            borderRadius: 'var(--radius-md)',
                                            marginBottom: '0.75rem',
                                            borderLeft: `3px solid ${citation.cited ? '#10b981' : '#6b7280'}`
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <div style={{ fontWeight: '600', fontSize: '0.95rem', flex: 1 }}>
                                                    "{citation.prompt}"
                                                </div>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '1rem',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    background: citation.cited ? 'rgba(16,185,129,0.15)' : 'rgba(107,114,128,0.15)',
                                                    color: citation.cited ? '#10b981' : '#9ca3af',
                                                    whiteSpace: 'nowrap',
                                                    marginLeft: '0.5rem'
                                                }}>
                                                    {citation.cited ? `✓ Cited ${getSentimentEmoji(citation.sentiment)}` : '✗ Not Cited'}
                                                </span>
                                            </div>
                                            {citation.context && citation.context.length > 0 && (
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                                    <strong>Context:</strong> "...{citation.context[0]}..."
                                                </div>
                                            )}
                                            {citation.response_snippet && (
                                                <details style={{ marginTop: '0.5rem' }}>
                                                    <summary style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', cursor: 'pointer' }}>
                                                        View AI Response
                                                    </summary>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', whiteSpace: 'pre-wrap' }}>
                                                        {citation.response_snippet}
                                                    </div>
                                                </details>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* History */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={20} /> Tracking History
                </h3>
                {historyLoading ? (
                    <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
                ) : history.length === 0 ? (
                    <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                        No tracking history yet. Run your first citation check above!
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>DOMAIN</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>NICHE</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>CITATIONS</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>RATE</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>DATE</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '0.75rem', fontWeight: '500' }}>{item.domain}</td>
                                        <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{item.niche}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.total_citations}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                            <span style={{ color: getCitationColor(item.citation_rate), fontWeight: '600' }}>
                                                {item.citation_rate}%
                                            </span>
                                        </td>
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
                )}
            </div>
        </div>
    )
}

export default CitationTracking
