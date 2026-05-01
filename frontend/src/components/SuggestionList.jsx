import React, { useState } from 'react'
import { Lightbulb, Circle, Wand2, RefreshCw, Check, Copy, AlertTriangle } from 'lucide-react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function SuggestionList({ suggestions, contentItemId, context = 'url', rawContent = "", onApplyInjection }) {
    const [fixingId, setFixingId] = useState(null)
    const [fixes, setFixes] = useState({}) // suggestion_text -> fix_data

    const handleFix = async (suggestionText, id) => {
        setFixingId(id)
        try {
            const response = await axios.post('/api/auto-fix', {
                content_item_id: contentItemId,
                content: rawContent,
                suggestion: suggestionText
            })
            setFixes(prev => ({ ...prev, [suggestionText]: response.data }))
        } catch (err) {
            console.error(err)
            alert("Optimization failed: " + (err.response?.data?.detail || err.message))
        } finally {
            setFixingId(null)
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        alert("Copied to clipboard!")
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'HIGH': return 'var(--error)'
            case 'MEDIUM': return 'var(--warning)'
            case 'LOW': return 'var(--text-secondary)'
            default: return 'var(--text-secondary)'
        }
    }

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'HIGH': return <Circle size={12} fill="currentColor" strokeWidth={0} />
            case 'MEDIUM': return <Circle size={12} fill="currentColor" strokeWidth={0} />
            case 'LOW': return <Circle size={12} fill="currentColor" strokeWidth={0} />
            default: return <Circle size={12} fill="currentColor" strokeWidth={0} />
        }
    }

    const safeSuggestions = Array.isArray(suggestions) ? suggestions : []

    // Normalize suggestions to handle both objects and simple strings
    const normalizedSuggestions = safeSuggestions.map((s, idx) => {
        const item = typeof s === 'string' ? {
            text: s,
            priority: 'MEDIUM',
            category: 'General',
            source: 'AI Engine'
        } : (s || {})
        return { ...item, id: item.id || `sug-${idx}` }
    })

    // Group by priority
    const groupedSuggestions = {
        HIGH: normalizedSuggestions.filter(s => s?.priority === 'HIGH'),
        MEDIUM: normalizedSuggestions.filter(s => s?.priority === 'MEDIUM'),
        LOW: normalizedSuggestions.filter(s => s?.priority === 'LOW')
    }

    return (
        <div className="glass-card" style={{ padding: '2rem', marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', paddingTop: '0.25rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Lightbulb size={24} color="var(--warning)" /> Optimization Recommendations
            </h2>

            {['HIGH', 'MEDIUM', 'LOW'].map(priority => {
                const items = groupedSuggestions[priority]
                if (items.length === 0) return null

                return (
                    <div key={priority} style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{
                            fontSize: '1rem',
                            marginBottom: '0.75rem',
                            color: getPriorityColor(priority),
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            {getPriorityIcon(priority)} {priority} Priority
                        </h3>

                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {items.map((suggestion) => (
                                <li key={suggestion.id} style={{
                                    background: 'var(--bg-secondary)',
                                    padding: '1.25rem',
                                    borderRadius: '12px',
                                    marginBottom: '1rem',
                                    borderLeft: `4px solid ${getPriorityColor(priority)}`,
                                    border: '1px solid var(--card-border)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
                                        <div>
                                            <p style={{ marginBottom: '0.5rem', fontWeight: '600', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                                                {suggestion.text}
                                            </p>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {suggestion.category} • {suggestion.source}
                                            </span>
                                        </div>
                                        
                                        {!fixes[suggestion.text] && (
                                            <button 
                                                className="btn btn-primary"
                                                style={{ 
                                                    padding: '0.5rem 1rem', 
                                                    fontSize: '0.85rem', 
                                                    borderRadius: '8px',
                                                    background: 'var(--accent-primary)',
                                                    border: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}
                                                onClick={() => handleFix(suggestion.text, suggestion.id)}
                                                disabled={fixingId !== null}
                                            >
                                                {fixingId === suggestion.id ? <RefreshCw size={14} className="spin" /> : <Wand2 size={14} />}
                                                {fixingId === suggestion.id ? 'Fixing...' : 'Fix with AI'}
                                            </button>
                                        )}
                                    </div>

                                    {/* Display Fix Result */}
                                    {fixes[suggestion.text] && (
                                        <div style={{ 
                                            marginTop: '1.25rem', 
                                            padding: '1.25rem', 
                                            background: 'var(--bg-tertiary)', 
                                            borderRadius: '10px',
                                            border: '1px solid var(--card-border)',
                                            position: 'relative'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: '700' }}>
                                                    <Check size={16} /> SURGICAL IMPROVEMENT GENERATED
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                    <button 
                                                        onClick={() => onApplyInjection(fixes[suggestion.text].optimized_content)}
                                                        style={{ 
                                                            background: 'var(--accent-primary)', 
                                                            border: 'none', 
                                                            color: 'white', 
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.4rem',
                                                            fontSize: '0.8rem',
                                                            padding: '0.3rem 0.75rem',
                                                            borderRadius: '6px',
                                                            fontWeight: '700'
                                                        }}
                                                    >
                                                        <Zap size={14} /> Inject into Editor
                                                    </button>
                                                    <button 
                                                        onClick={() => copyToClipboard(fixes[suggestion.text].optimized_content)}
                                                        style={{ 
                                                            background: 'rgba(255,255,255,0.05)', 
                                                            border: '1px solid var(--card-border)', 
                                                            color: 'var(--text-secondary)', 
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.4rem',
                                                            fontSize: '0.8rem',
                                                            padding: '0.3rem 0.75rem',
                                                            borderRadius: '6px'
                                                        }}
                                                    >
                                                        <Copy size={14} /> Copy
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="markdown-content" style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {fixes[suggestion.text].optimized_content}
                                                </ReactMarkdown>

                                                {/* NEW: Citation Warnings for this specific fix */}
                                                {fixes[suggestion.text].citation_warnings && fixes[suggestion.text].citation_warnings.length > 0 && (
                                                    <div style={{ 
                                                        marginTop: '1.5rem', 
                                                        padding: '1rem', 
                                                        background: 'rgba(239, 68, 68, 0.03)', 
                                                        borderRadius: '8px', 
                                                        border: '1px solid rgba(239, 68, 68, 0.15)' 
                                                    }}>
                                                        <div style={{ color: 'var(--error)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                            <AlertTriangle size={14} /> CLAIMS NEEDING REAL SOURCES
                                                        </div>
                                                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                                                            {fixes[suggestion.text].citation_warnings.map((flag, i) => (
                                                                <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
                                                                    <span>⚠️</span>
                                                                    <span>{flag}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {fixes[suggestion.text].geo_lift_estimate && (
                                                <div style={{ 
                                                    marginTop: '1.25rem', 
                                                    paddingTop: '1rem', 
                                                    borderTop: '1px solid var(--card-border)',
                                                    fontSize: '0.8rem',
                                                    color: 'var(--accent-primary)',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}>
                                                    <span>Structural Improvement Score:</span>
                                                    <span style={{ color: 'var(--text-primary)' }}>
                                                        {fixes[suggestion.text].geo_lift_estimate.replace('Estimated ', '').replace(' visibility', '')}
                                                    </span>
                                                    <div className="tooltip-trigger" style={{ cursor: 'help', opacity: 0.7 }}>
                                                        <Circle size={12} />
                                                        <span className="tooltip-text">
                                                            This score measures structural changes only (entity density, readability, answer clarity). 
                                                            Actual citation performance depends on publishing and indexing by AI engines.
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )
            })}
        </div>
    )
}

export default SuggestionList
