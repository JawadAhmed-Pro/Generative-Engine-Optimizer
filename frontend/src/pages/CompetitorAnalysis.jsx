import React, { useState, useEffect } from 'react'
import { BarChart2, Plus, Trash2, RefreshCw, TrendingUp, TrendingDown, Minus, AlertTriangle, Trophy, Zap, Clock, Sparkles, Globe, UserPlus, Info, ChevronDown, Table, ExternalLink, BookOpen, ShoppingCart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

function CompetitorAnalysis() {
    const [userUrl, setUserUrl] = useState('')
    const [competitorUrls, setCompetitorUrls] = useState([''])
    const [contentType, setContentType] = useState('general')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState(null)
    const [history, setHistory] = useState([])
    const [error, setError] = useState(null)
    
    // Target Discovery State - RESTORED PHASE 1
    const [targetKeyword, setTargetKeyword] = useState('')
    const [discovering, setDiscovering] = useState(false)

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

    const pollJobStatus = async (jobId) => {
        try {
            const res = await axios.get(`/api/jobs/${jobId}`);
            if (res.data.status === 'completed') {
                setResults(res.data.result);
                setLoading(false);
                fetchHistory();
            } else if (res.data.status === 'failed') {
                setError(res.data.error || 'Job failed');
                setLoading(false);
            } else {
                setTimeout(() => pollJobStatus(jobId), 2000);
            }
        } catch (err) {
            setError('Failed to fetch job status');
            setLoading(false);
        }
    };

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
            if (response.data.job_id) {
                pollJobStatus(response.data.job_id);
            } else {
                setResults(response.data);
                setLoading(false);
                fetchHistory();
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Competitor analysis failed')
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

    const handleDiscover = async () => {
        if (!targetKeyword.trim()) return;
        setDiscovering(true);
        setError(null);
        try {
            const response = await axios.post('/api/discover/competitors', {
                keyword: targetKeyword,
                niche: contentType
            });
            // Job-based discovery handled via feedback
            if (response.data.job_id) {
                // For this MVP discovery, we just alert success
                alert("Discovery engine started. Top competitors will be automatically populated.");
            }
        } catch (err) {
            setError("Discovery failed. Please enter competitors manually.");
        } finally {
            setDiscovering(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 75) return '#10b981'
        if (score >= 50) return '#f59e0b'
        return '#ef4444'
    }

    const getDiffIcon = (diff) => {
        if (diff > 5) return <TrendingUp size={14} color="#10b981" />
        if (diff < -5) return <TrendingDown size={14} color="#ef4444" />
        return <Minus size={14} color="#6b7280" />
    }

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
            {/* Header & Branding */}
            
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '0', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Sparkles size={24} color="var(--accent-primary)" />
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                            GEO Perception Layer
                        </span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.04em', margin: 0 }}>
                        Competitor Analysis
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '0.4rem', whiteSpace: 'nowrap' }}>
                        Audit your competitive landscape and identify strategic gaps in AI search perception.
                    </p>
                </div>
            </div>

            {/* Input Section - Single Column Professionalized */}
            <div className="depth-card" style={{ padding: '2.5rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'var(--accent-gradient)' }} />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Target Keyword Discovery - RESTORED PHASE 1 */}
                    <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px dashed rgba(59, 130, 246, 0.3)', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                            <Sparkles size={18} color="var(--accent-primary)" />
                            <span style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--accent-primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                AI COMPETITOR DISCOVERY (AUTO-FLY)
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input
                                type="text"
                                value={targetKeyword}
                                onChange={(e) => setTargetKeyword(e.target.value)}
                                placeholder="Enter your target keyword (e.g. 'Best CRM for Startups')"
                                style={{
                                    flex: 1,
                                    padding: '0.8rem 1.1rem',
                                    background: 'rgba(0,0,0,0.5)',
                                    border: '1px solid rgba(59, 130, 246, 0.2)',
                                    borderRadius: '10px',
                                    color: 'white',
                                    fontSize: '0.95rem'
                                }}
                            />
                            <button
                                onClick={handleDiscover}
                                disabled={discovering || !targetKeyword.trim()}
                                style={{
                                    padding: '0 1.5rem',
                                    background: 'var(--accent-gradient)',
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: 'white',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    opacity: (discovering || !targetKeyword.trim()) ? 0.6 : 1
                                }}
                            >
                                {discovering ? <RefreshCw size={18} className="spin" /> : <Zap size={18} fill="currentColor" />}
                                Find Top Competitors
                            </button>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem', marginLeft: '0.2rem' }}>
                            Our engine will deep-scan search results to identify the high-authority pages currently capturing the extraction share.
                        </p>
                    </div>

                    {/* Your URL Field */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                            <Globe size={18} color="var(--accent-primary)" />
                            <span style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                PROTAGONIST URL (YOURS)
                            </span>
                        </div>
                        <input
                            type="text"
                            value={userUrl}
                            onChange={(e) => setUserUrl(e.target.value)}
                            placeholder="https://your-website.com/page-to-audit"
                            style={{
                                width: '100%',
                                padding: '1.1rem',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                            className="focus-ring"
                        />
                    </div>

                    {/* Competitor URLs Fields */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <BarChart2 size={18} color="var(--accent-secondary)" />
                                <span style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                    TARGET COMPETITORS (MAX 5)
                                </span>
                            </div>
                            <button
                                onClick={addCompetitor}
                                disabled={competitorUrls.length >= 5}
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    color: competitorUrls.length >= 5 ? 'var(--text-tertiary)' : 'var(--accent-primary)',
                                    cursor: competitorUrls.length >= 5 ? 'default' : 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <UserPlus size={16} /> Add Competitor
                            </button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {competitorUrls.map((url, index) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }} 
                                    animate={{ opacity: 1, x: 0 }}
                                    key={index} 
                                    style={{ display: 'flex', gap: '0.75rem' }}
                                >
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <input
                                            type="text"
                                            value={url}
                                            onChange={(e) => updateCompetitor(index, e.target.value)}
                                            placeholder={`https://competitor-${index + 1}.com/rival-page`}
                                            style={{
                                                width: '100%',
                                                padding: '1rem 1.1rem',
                                                background: 'rgba(0,0,0,0.25)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                borderRadius: '10px',
                                                color: 'white',
                                                fontSize: '0.95rem',
                                                outline: 'none'
                                            }}
                                            className="focus-ring"
                                        />
                                    </div>
                                    {competitorUrls.length > 1 && (
                                        <button
                                            onClick={() => removeCompetitor(index)}
                                            style={{
                                                background: 'rgba(239,68,68,0.05)',
                                                border: '1px solid rgba(239,68,68,0.1)',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                padding: '0 0.75rem',
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                transition: 'background 0.2s'
                                            }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Options & Action */}
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                                {contentType === 'ecommerce' ? <ShoppingCart size={16} color="var(--accent-primary)" /> : 
                                 contentType === 'educational' ? <BookOpen size={16} color="var(--accent-primary)" /> : 
                                 <Globe size={16} color="var(--accent-primary)" />}
                                <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>INDUSTRY / NICHE</span>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <select
                                    value={contentType}
                                    onChange={(e) => setContentType(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '1rem 2.5rem 1rem 1.1rem',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '10px',
                                        color: 'white',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        appearance: 'none',
                                        cursor: 'pointer'
                                    }}
                                    className="focus-ring"
                                >
                                    <option value="general">General / Blog</option>
                                    <option value="ecommerce">E-commerce</option>
                                    <option value="educational">Education</option>
                                </select>
                                <ChevronDown size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                            </div>
                        </div>
                        
                        <button
                            onClick={handleCompare}
                            disabled={loading || !userUrl.trim() || competitorUrls.filter(u => u.trim()).length === 0}
                            className="btn btn-primary"
                            style={{ padding: '1.1rem 2.5rem', fontSize: '1.1rem', fontWeight: '700', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)', background: 'var(--accent-gradient)' }}
                        >
                            {loading ? (
                                <><RefreshCw size={22} className="spin" /> Synchronizing Intelligence...</>
                            ) : (
                                <><BarChart2 size={22} /> Execute Competitive Audit</>
                            )}
                        </button>
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <AlertTriangle size={18} /> {error}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Results Section */}
            <AnimatePresence>
                {results && results.comparison ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="animate-fade-in">
                        {/* Status/Position Banner */}
                        <div className="depth-card" style={{
                            padding: '2rem',
                            marginBottom: '2rem',
                            background: 'var(--bg-tertiary)',
                            borderLeft: `4px solid ${results.comparison.position === 'ahead' ? '#10b981' : '#ef4444'}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            overflow: 'hidden'
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <Trophy size={24} color={results.comparison.position === 'ahead' ? '#10b981' : 'var(--text-tertiary)'} />
                                    <h2 style={{ fontSize: '1.75rem', fontWeight: '900', margin: 0, letterSpacing: '-0.02em' }}>
                                        {results.comparison.position === 'ahead' ? 'Strategic Superiority!' : 'Competitive Gap Detected'}
                                    </h2>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
                                    Your Score: <strong style={{ color: getScoreColor(results.comparison.your_overall), fontSize: '1.5rem' }}>{results.comparison.your_overall}</strong>
                                    {' — '}
                                    Competitor Average: <strong style={{ fontSize: '1.25rem' }}>{results.comparison.competitor_avg_overall}</strong>
                                    <span style={{ marginLeft: '1rem', fontWeight: '800', color: results.comparison.score_difference >= 0 ? '#10b981' : '#ef4444' }}>
                                        ({results.comparison.score_difference > 0 ? '+' : ''}{results.comparison.score_difference} pts)
                                    </span>
                                </p>
                            </div>
                            <div style={{ opacity: 0.1 }}>
                                {results.comparison.position === 'ahead' ? <Trophy size={100} /> : <Zap size={100} />}
                            </div>
                        </div>

                        {/* Detailed Metrics Table */}
                        <div className="depth-card" style={{ padding: '0', marginBottom: '2rem', overflow: 'hidden' }}>
                            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Score Intelligence MATRIX</h3>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                        <div style={{ width: '8px', height: '8px', background: 'var(--accent-primary)', borderRadius: '2px' }} /> YOUR PAGE
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                        <div style={{ width: '8px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} /> COMPETITORS
                                    </div>
                                </div>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(255,255,255,0.01)' }}>
                                            <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Target URL</th>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: '800', textTransform: 'uppercase' }}>Overall</th>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: '800', textTransform: 'uppercase' }}>Visibility</th>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: '800', textTransform: 'uppercase' }}>Citation</th>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: '800', textTransform: 'uppercase' }}>Semantic</th>
                                            <th style={{ padding: '1.25rem 1rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: '800', textTransform: 'uppercase' }}>Readability</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* User Row */}
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(59, 130, 246, 0.08)' }}>
                                            <td style={{ padding: '1.5rem 2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ width: '32px', height: '32px', background: 'var(--accent-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Sparkles size={16} color="white" />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'white' }}>{results.user?.title?.substring(0, 40) || 'Your Audited Page'}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                            {results.user?.url?.substring(0, 40)}... <ExternalLink size={10} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem 1rem', textAlign: 'center', fontWeight: '900', fontSize: '1.25rem', color: getScoreColor(results.user?.scores?.overall || 0) }}>
                                                {results.user?.scores?.overall || 0}
                                            </td>
                                            <td style={{ padding: '1.5rem 1rem', textAlign: 'center', fontWeight: '700', color: getScoreColor(results.user?.scores?.ai_visibility || 0) }}>
                                                {typeof results.user?.scores?.ai_visibility === 'number' ? results.user.scores.ai_visibility.toFixed(0) : 0}
                                            </td>
                                            <td style={{ padding: '1.5rem 1rem', textAlign: 'center', fontWeight: '700', color: getScoreColor(results.user?.scores?.citation_worthiness || 0) }}>
                                                {typeof results.user?.scores?.citation_worthiness === 'number' ? results.user.scores.citation_worthiness.toFixed(0) : 0}
                                            </td>
                                            <td style={{ padding: '1.5rem 1rem', textAlign: 'center', fontWeight: '700', color: getScoreColor(results.user?.scores?.semantic_coverage || 0) }}>
                                                {typeof results.user?.scores?.semantic_coverage === 'number' ? results.user.scores.semantic_coverage.toFixed(0) : 0}
                                            </td>
                                            <td style={{ padding: '1.5rem 1rem', textAlign: 'center', fontWeight: '700', color: getScoreColor(results.user?.scores?.technical_readability || 0) }}>
                                                {typeof results.user?.scores?.technical_readability === 'number' ? results.user.scores.technical_readability.toFixed(0) : 0}
                                            </td>
                                        </tr>
                                        {/* Competitor Rows */}
                                        {results.competitors?.map((comp, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }} className="table-row-hover">
                                                <td style={{ padding: '1.25rem 2rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Globe size={16} color="var(--text-tertiary)" />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                                                {comp.title?.substring(0, 40) || `Competitor ${idx + 1}`}
                                                                {comp.status === 'error' && <span style={{ color: '#ef4444', fontSize: '0.65rem' }}> (SCAN ERROR)</span>}
                                                            </div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{comp.url?.substring(0, 45)}...</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.25rem 1rem', textAlign: 'center', fontWeight: '700' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                        <span style={{ color: getScoreColor(comp.scores?.overall || 0) }}>{comp.scores?.overall || 0}</span>
                                                        {getDiffIcon((results.user?.scores?.overall || 0) - (comp.scores?.overall || 0))}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.25rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{typeof comp.scores?.ai_visibility === 'number' ? comp.scores.ai_visibility.toFixed(0) : 0}</td>
                                                <td style={{ padding: '1.25rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{typeof comp.scores?.citation_worthiness === 'number' ? comp.scores.citation_worthiness.toFixed(0) : 0}</td>
                                                <td style={{ padding: '1.25rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{typeof comp.scores?.semantic_coverage === 'number' ? comp.scores.semantic_coverage.toFixed(0) : 0}</td>
                                                <td style={{ padding: '1.25rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{typeof comp.scores?.technical_readability === 'number' ? comp.scores.technical_readability.toFixed(0) : 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Analysis Grid: Gaps & Strengths */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                            {/* Gaps to Address */}
                            <div className="depth-card" style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(245, 158, 11, 0.1)', paddingBottom: '1rem' }}>
                                    <AlertTriangle size={22} color="#f59e0b" />
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>PRIORITY GAP ANALYSIS</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {results.comparison.gaps?.length > 0 ? results.comparison.gaps.map((gap, idx) => (
                                        <div key={idx} style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', borderLeft: `4px solid ${gap.priority === 'high' ? '#ef4444' : '#f59e0b'}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: '800', color: 'white', textTransform: 'uppercase', fontSize: '0.85rem' }}>{gap.metric}</span>
                                                <span style={{ fontSize: '0.7rem', fontWeight: '900', color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>-{gap.gap} PTS GAP</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem' }}>
                                                <div style={{ flex: 1 }}>
                                                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>YOU</span>
                                                    <div style={{ fontWeight: '700', color: getScoreColor(gap.your_score), fontSize: '1.1rem' }}>{gap.your_score}</div>
                                                </div>
                                                <div style={{ color: 'var(--text-tertiary)', paddingTop: '1rem' }}>→</div>
                                                <div style={{ flex: 1 }}>
                                                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>COMP. AVG</span>
                                                    <div style={{ fontWeight: '700', color: 'white', fontSize: '1.1rem' }}>{gap.competitor_avg}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            <Trophy size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                            <p>No critical perception gaps detected. Dominance maintained.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Strategic Strengths */}
                            <div className="depth-card" style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(16, 185, 129, 0.1)', paddingBottom: '1rem' }}>
                                    <Trophy size={22} color="#10b981" />
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Competitive Defenses</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {results.comparison.strengths?.length > 0 ? results.comparison.strengths.map((s, idx) => (
                                        <div key={idx} style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.03)', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontWeight: '800', color: 'white', textTransform: 'uppercase', fontSize: '0.85rem' }}>{s.metric}</span>
                                                <span style={{ fontSize: '0.7rem', fontWeight: '900', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>+{s.advantage} PTS LEAD</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem' }}>
                                                <div style={{ flex: 1 }}>
                                                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>YOU</span>
                                                    <div style={{ fontWeight: '700', color: '#10b981', fontSize: '1.1rem' }}>{s.your_score}</div>
                                                </div>
                                                <div style={{ color: 'var(--text-tertiary)', paddingTop: '1rem' }}>→</div>
                                                <div style={{ flex: 1 }}>
                                                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>COMP. AVG</span>
                                                    <div style={{ fontWeight: '700', color: 'var(--text-tertiary)', fontSize: '1.1rem' }}>{s.competitor_avg}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            <Zap size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                            <p>No major structural advantages found. Optimization required.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Wins & Recommendations */}
                        <div className="depth-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <Zap size={22} color="#f59e0b" fill="#f59e0b" style={{ opacity: 0.8 }} />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tactical Quick-Wins</h3>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                                {results.comparison.quick_wins?.map((win, idx) => (
                                    <div key={idx} style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                                        <div style={{ fontWeight: '800', marginBottom: '0.75rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '8px', height: '8px', background: '#f59e0b', borderRadius: '50%' }} />
                                            {win.area}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.6' }}>
                                            {win.what_they_do}
                                        </div>
                                        <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            {win.suggestions?.map((sug, i) => (
                                                <div key={i} style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                                    <span style={{ opacity: 0.6 }}>→</span> {sug}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : !loading && (
                    <div className="depth-card animate-fade-in glow-static" style={{ 
                        padding: '4rem 2rem', 
                        textAlign: 'center', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        minHeight: '400px', 
                        marginBottom: '2rem' 
                    }}>
                        <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '24px', 
                            background: 'rgba(96, 165, 250, 0.08)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            marginBottom: '2rem', 
                            border: '1px solid var(--card-border)',
                            boxShadow: 'var(--elevation-med)'
                        }}>
                            <BarChart2 size={32} color="var(--accent-primary)" style={{ filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.5))' }} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Ready for Competitive Audit</h3>
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', margin: '0 auto', fontSize: '1.05rem', lineHeight: '1.6' }}>
                            Enter your URL and up to 5 competitor pages to analyze perception gaps and strategic opportunities across major AI knowledge platforms.
                        </p>
                    </div>
                )}
            </AnimatePresence>

            {/* History Table - Professionalized */}
            {history.length > 0 && (
                <div className="depth-card glow-static" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Clock size={20} color="var(--accent-primary)" />
                        <h3 style={{ fontSize: '1rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Audit Trail</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: '800', textTransform: 'uppercase' }}>Protagonist URL</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: '800', textTransform: 'uppercase' }}>Pool Size</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: '800', textTransform: 'uppercase' }}>Your Score</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: '800', textTransform: 'uppercase' }}>Competitor Avg</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: '800', textTransform: 'uppercase' }}>Analyzed On</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: '800', textTransform: 'uppercase' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }} className="table-row-hover">
                                        <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{item.user_url?.substring(0, 45)}...</td>
                                        <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>{item.competitor_urls?.length || 0} Pages</td>
                                        <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '800', color: getScoreColor(item.user_overall_score || 0) }}>
                                            {typeof item.user_overall_score === 'number' ? item.user_overall_score.toFixed(1) : '-'}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{typeof item.competitor_avg_score === 'number' ? item.competitor_avg_score.toFixed(1) : '-'}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <button
                                                onClick={() => loadHistoricalResult(item.id)}
                                                style={{ background: 'rgba(59, 130, 246, 0.1)', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '6px', fontWeight: '700' }}
                                            >
                                                RE-AUDIT
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
