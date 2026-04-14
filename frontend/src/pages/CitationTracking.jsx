import React, { useState, useEffect } from 'react'
import { Globe, Search, TrendingUp, RefreshCw, ChevronDown, ChevronUp, ExternalLink, Clock, Sparkles, Target, Tag, BookOpen, ShoppingCart, Info, Folder, FileText, Heart, Activity } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

function CitationTracking() {
    const [domain, setDomain] = useState('')
    const [brandName, setBrandName] = useState('')
    const [niche, setNiche] = useState('general')
    const [customPrompts, setCustomPrompts] = useState('')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState(null)
    const [history, setHistory] = useState([])
    const [historyLoading, setHistoryLoading] = useState(true)
    const [expandedPlatform, setExpandedPlatform] = useState(null)
    const [error, setError] = useState(null)

    const nicheConfigs = {
        general: {
            label: 'General / Blog',
            icon: <Globe size={16} />,
            primaryIcon: <Globe size={18} color="var(--accent-primary)" />,
            domainPlaceholder: 'e.g. example.com',
            brandPlaceholder: 'e.g. MyBrand',
            promptPlaceholder: 'Enter strategic queries to test citation frequency (one per line)...',
            description: 'Track broad authority and brand citations across major AI knowledge platforms.'
        },
        ecommerce: {
            label: 'E-commerce',
            icon: <ShoppingCart size={16} />,
            primaryIcon: <ShoppingCart size={18} color="var(--success)" />,
            domainPlaceholder: 'e.g. mystore.com',
            brandPlaceholder: 'e.g. LuxeBrand',
            promptPlaceholder: 'Enter product comparison or purchase intent queries...',
            description: 'Analyze product referral probability and shopping assistant citations.'
        },
        education: {
            label: 'Education',
            icon: <BookOpen size={16} />,
            primaryIcon: <BookOpen size={18} color="var(--accent-secondary)" />,
            domainPlaceholder: 'e.g. university.edu',
            brandPlaceholder: 'e.g. EduLearn',
            promptPlaceholder: 'Enter academic or informational research queries...',
            description: 'Audit academic authority and educational resource citations in training sets.'
        }
    }

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
            if (response.data.niche) setNiche(response.data.niche)
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

    const currentConfig = nicheConfigs[niche] || nicheConfigs.technology

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
            {/* Header */}
            
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '0', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Sparkles size={24} color="var(--accent-primary)" />
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                            GEO Perception Layer
                        </span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.04em', margin: 0 }}>
                        Citation Tracking
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '0.4rem', whiteSpace: 'nowrap' }}>
                        Scan AI knowledge bases to track citation frequency and authority mentions across major LLMs.
                    </p>
                </div>
            </div>

            {/* Segmented Niche Selector - Matches Visibility Analysis Style */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
                <div style={{ 
                    display: 'inline-flex', 
                    background: 'var(--bg-tertiary)', 
                    padding: '4px', 
                    borderRadius: '12px', 
                    border: '1px solid var(--card-border)',
                    gap: '4px',
                    overflowX: 'auto',
                    maxWidth: '100%',
                    scrollbarWidth: 'none'
                }}>
                    {Object.entries(nicheConfigs).map(([id, config]) => (
                        <button
                            key={id}
                            onClick={() => setNiche(id)}
                            style={{
                                padding: '0.75rem 1.25rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: niche === id ? 'var(--accent-primary)' : 'transparent',
                                color: niche === id ? 'white' : 'var(--text-secondary)',
                                fontWeight: '600',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {config.icon} {config.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                {/* Left Column - Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div className="depth-card" style={{ padding: '2rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'var(--accent-gradient)' }} />
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                                        {currentConfig.primaryIcon}
                                        <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>TRACKING DOMAIN</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={domain}
                                        onChange={(e) => setDomain(e.target.value)}
                                        placeholder={currentConfig.domainPlaceholder}
                                        style={{ width: '100%', padding: '0.85rem 1.1rem', background: 'transparent', border: '1px solid var(--card-border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' }}
                                        className="focus-ring"
                                    />
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                                        <Tag size={16} color="var(--accent-secondary)" />
                                        <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>BRAND IDENTITY</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={brandName}
                                        onChange={(e) => setBrandName(e.target.value)}
                                        placeholder={currentConfig.brandPlaceholder}
                                        style={{ width: '100%', padding: '0.85rem 1.1rem', background: 'transparent', border: '1px solid var(--card-border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' }}
                                        className="focus-ring"
                                    />
                                </div>
                            </div>

                            <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--section-divider)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                                    <FileText size={16} color="var(--accent-primary)" />
                                    <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>CUSTOM PROMPTS (OPTIONAL)</span>
                                </div>
                                <textarea
                                    value={customPrompts}
                                    onChange={(e) => setCustomPrompts(e.target.value)}
                                    placeholder={currentConfig.promptPlaceholder}
                                    rows={3}
                                    style={{ width: '100%', padding: '0.85rem 1.1rem', background: 'transparent', border: '1px solid var(--card-border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none', resize: 'none' }}
                                    className="focus-ring"
                                />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: '0.75rem' }}>
                                    <Info size={14} />
                                    <span>Specialized for {currentConfig.label} category analysis.</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleTrack}
                        disabled={loading || !domain.trim()}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1.25rem', background: 'var(--accent-gradient)', border: 'none', fontSize: '1.1rem', fontWeight: '700', gap: '0.75rem', boxShadow: '0 4px 20px rgba(59, 130, 246, 0.2)', marginTop: 'auto' }}
                    >
                        {loading ? (
                            <><RefreshCw size={22} className="spin" /> Initializing Scan...</>
                        ) : (
                            <><Search size={22} /> Execute {currentConfig.label} Citation Scan</>
                        )}
                    </button>

                    {error && (
                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#ef4444', fontSize: '0.9rem' }}>
                            <Info size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> {error}
                        </div>
                    )}
                </div>

                {/* Right Column - Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="depth-card" style={{ padding: '0', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--section-divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>SCAN HISTORY</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '700' }}>{history.length}</span>
                        </div>
                        {historyLoading ? (
                            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading history...</div>
                        ) : history.length === 0 ? (
                            <div style={{ padding: '4.5rem 2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Clock size={24} style={{ opacity: 0.2, marginBottom: '1rem', margin: '0 auto' }} />
                                <p>No history found.</p>
                            </div>
                        ) : (
                            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '550px' }}>
                                {history.map(item => (
                                    <div key={item.id} onClick={() => loadHistoricalResult(item.id)} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--section-divider)', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '2px solid var(--accent-primary)' }} className="history-item-hover">
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)', wordBreak: 'break-all', lineHeight: '1.4' }}>{item.domain}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.niche}</span>
                                                    <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>•</span>
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{new Date(item.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div style={{ fontSize: '0.7rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '4px', background: getCitationColor(item.citation_rate) + '15', color: getCitationColor(item.citation_rate), border: `1px solid ${getCitationColor(item.citation_rate)}20` }}>{item.citation_rate}%</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Results Area - Full Width Following Top Grid */}
            <div style={{ marginTop: '1.5rem' }}>
                {results ? (
                    <div className="animate-fade-in">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                            {[
                                { label: 'CITATION RATE', value: `${results.summary?.overall_citation_rate || 0}%`, sub: 'Across platforms', color: getCitationColor(results.summary?.overall_citation_rate || 0) },
                                { label: 'TOTAL MENTIONS', value: results.summary?.total_citations || 0, sub: 'Direct citations', color: 'var(--accent-primary)' },
                                { label: 'PROMPTS TESTED', value: results.summary?.prompts_tested || 0, sub: 'Strategic queries', color: 'white' }
                            ].map((stat, i) => (
                                <div key={i} className="depth-card" style={{ padding: '1.5rem', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-tertiary)', letterSpacing: '0.1em', marginBottom: '1rem' }}>{stat.label}</div>
                                    <div style={{ fontSize: '2rem', fontWeight: '900', color: stat.color, marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>{stat.value}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{stat.sub}</div>
                                    <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.03 }}>
                                        <TrendingUp size={80} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {results.platforms && Object.entries(results.platforms).map(([key, platform]) => (
                                <div key={key} className="depth-card" style={{ padding: '0', overflow: 'hidden', border: platform.status === 'error' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--card-border)' }}>
                                    <div onClick={() => setExpandedPlatform(expandedPlatform === key ? null : key)} style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: expandedPlatform === key ? 'var(--bg-tertiary)' : 'transparent', transition: 'background 0.2s' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>{key === 'perplexity' ? '🔍' : key === 'gemini' ? '✨' : '🤖'}</div>
                                            <div>
                                                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>{platform.name}</h3>
                                                <div style={{ fontSize: '0.8rem', color: platform.status === 'error' ? 'var(--error)' : 'var(--text-secondary)', marginTop: '0.2rem' }}>{platform.status === 'error' ? platform.error : `${platform.total_mentions || 0} citations detected`}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                            <div style={{ padding: '0.3rem 0.8rem', borderRadius: '6px', background: getCitationColor(platform.citation_rate || 0) + '15', color: getCitationColor(platform.citation_rate || 0), fontWeight: '800', fontSize: '0.85rem', border: `1px solid ${getCitationColor(platform.citation_rate || 0)}20` }}>{platform.citation_rate || 0}%</div>
                                            {expandedPlatform === key ? <ChevronUp size={18} color="var(--text-tertiary)" /> : <ChevronDown size={18} color="var(--text-tertiary)" />}
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {expandedPlatform === key && platform.citations && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                                <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                    {platform.citations.map((citation, idx) => (
                                                        <div key={idx} style={{ padding: '1.25rem', background: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--card-border)', borderLeft: `4px solid ${citation.cited ? 'var(--success)' : 'var(--card-border)'}`, position: 'relative', overflow: 'hidden' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                                <div style={{ fontWeight: '700', fontSize: '0.95rem', flex: 1, color: 'var(--text-primary)', lineHeight: '1.6' }}>
                                                                    <span style={{ color: 'var(--accent-primary)', marginRight: '0.25rem' }}>Q:</span> "{citation.prompt}"
                                                                </div>
                                                                <div style={{ padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', background: citation.cited ? 'rgba(16,185,129,0.1)' : 'var(--bg-secondary)', color: citation.cited ? 'var(--success)' : 'var(--text-tertiary)', marginLeft: '1.5rem', whiteSpace: 'nowrap', border: citation.cited ? '1px solid rgba(16,185,129,0.2)' : '1px solid var(--card-border)' }}>
                                                                    {citation.cited ? `Found Reference ${getSentimentEmoji(citation.sentiment)}` : 'Reference Missing'}
                                                                </div>
                                                            </div>
                                                            {citation.context && citation.context.length > 0 && (
                                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.75rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', fontStyle: 'italic', border: '1px solid var(--card-border)', lineHeight: '1.6' }}>
                                                                    <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>AI CITATION CONTEXT:</div>
                                                                    "...{citation.context[0]}..."
                                                                </div>
                                                            )}
                                                            <div style={{ position: 'absolute', right: 0, bottom: 0, opacity: 0.05, padding: '0.5rem' }}>
                                                                {citation.cited ? <Sparkles size={40} /> : <Target size={40} />}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="depth-card animate-fade-in" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', marginBottom: '2rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', border: '1px solid var(--card-border)' }}>
                            <div style={{ transform: 'scale(1.2)' }}>{currentConfig.primaryIcon}</div>
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Ready for {currentConfig.label} Citation Scan</h3>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', margin: '0 auto', fontSize: '1.05rem', lineHeight: '1.6' }}>
                            {currentConfig.description} Enter your details above to begin the intelligence audit.
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                .history-item-hover:hover {
                    background: rgba(255,255,255,0.03) !important;
                    transform: translateX(4px);
                }
                .focus-ring:focus {
                    border-color: var(--accent-primary) !important;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
                }
            `}</style>
        </div>
    )
}

export default CitationTracking
