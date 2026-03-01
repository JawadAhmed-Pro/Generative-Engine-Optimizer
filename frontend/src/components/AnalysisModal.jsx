import { useState, useEffect } from 'react'
import { X, ExternalLink, Calendar, TrendingUp, FileText, Link as LinkIcon, AlertCircle, Download, Copy, Check } from 'lucide-react'
import axios from 'axios'
import { useToast } from './ToastProvider'

function AnalysisModal({ itemId, onClose }) {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [copied, setCopied] = useState(false)
    const toast = useToast()

    useEffect(() => {
        if (itemId) {
            fetchAnalysis()
        }
    }, [itemId])

    const fetchAnalysis = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`/api/analysis/${itemId}`)
            setData(response.data)
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load analysis')
        } finally {
            setLoading(false)
        }
    }

    const getScoreColor = (score) => {
        if (score >= 70) return 'var(--success)'
        if (score >= 50) return 'var(--warning)'
        return 'var(--error)'
    }

    const handleExportJSON = () => {
        if (!data) return
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `geo-analysis-${itemId}.json`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Analysis exported as JSON')
    }

    const handleCopyResults = () => {
        if (!data) return
        const text = `
GEO Analysis Report
==================
Title: ${data.title || 'N/A'}
URL: ${data.url || 'N/A'}
Date: ${new Date(data.created_at).toLocaleDateString()}

SCORES
------
Overall: ${data.analysis.overall_score}/100
AI Visibility: ${data.analysis.ai_visibility_score}/100
Citation Worthiness: ${data.analysis.citation_worthiness_score}/100
Semantic Coverage: ${data.analysis.semantic_coverage_score}/100
Technical Readability: ${data.analysis.technical_readability_score}/100

AI FEEDBACK
-----------
${data.analysis.llm_feedback || 'No feedback available'}

RECOMMENDATIONS
---------------
${data.analysis.recommendations?.map((r, i) => `${i + 1}. ${r}`).join('\n') || 'No recommendations'}
        `.trim()

        navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success('Results copied to clipboard')
        setTimeout(() => setCopied(false), 2000)
    }

    if (!itemId) return null

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
        }} onClick={onClose}>
            <div
                className="glass-card animate-fade-in"
                style={{
                    width: '100%',
                    maxWidth: '900px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    padding: '2rem'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                            {loading ? 'Loading...' : data?.title || 'Analysis Details'}
                        </h2>
                        {data?.url && (
                            <a
                                href={data.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--accent-primary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                                <ExternalLink size={14} /> {data.url}
                            </a>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {data && (
                            <>
                                <button
                                    onClick={handleCopyResults}
                                    title="Copy to clipboard"
                                    style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        border: 'none',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        padding: '0.5rem',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {copied ? <Check size={18} color="var(--success)" /> : <Copy size={18} />}
                                </button>
                                <button
                                    onClick={handleExportJSON}
                                    title="Download JSON"
                                    style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        border: 'none',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        padding: '0.5rem',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Download size={18} />
                                </button>
                            </>
                        )}
                        <button
                            onClick={onClose}
                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        Loading analysis...
                    </div>
                )}

                {error && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--error)' }}>
                        <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <div>{error}</div>
                    </div>
                )}

                {data && !loading && !error && (
                    <>
                        {/* Score Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: '700', color: getScoreColor(data.analysis.overall_score) }}>
                                    {data.analysis.overall_score}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>OVERALL</div>
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{data.analysis.ai_visibility_score}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>AI Visibility</div>
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{data.analysis.citation_worthiness_score}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Citation</div>
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{data.analysis.semantic_coverage_score}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Semantic</div>
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{data.analysis.technical_readability_score}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Readability</div>
                            </div>
                        </div>

                        {/* Metadata */}
                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calendar size={14} /> {new Date(data.created_at).toLocaleDateString()}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {data.url ? <LinkIcon size={14} /> : <FileText size={14} />}
                                {data.url ? 'URL Analysis' : 'Text Analysis'}
                            </span>
                        </div>

                        {/* LLM Feedback */}
                        {data.analysis.llm_feedback && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>AI Feedback</h3>
                                <div style={{
                                    background: 'rgba(0,0,0,0.2)',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    lineHeight: '1.6',
                                    color: 'var(--text-secondary)'
                                }}>
                                    {data.analysis.llm_feedback}
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        {data.analysis.recommendations && data.analysis.recommendations.length > 0 && (
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>Recommendations</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {data.analysis.recommendations.map((rec, idx) => (
                                        <div key={idx} style={{
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '6px',
                                            fontSize: '0.875rem',
                                            borderLeft: '3px solid var(--accent-primary)'
                                        }}>
                                            {rec}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default AnalysisModal
