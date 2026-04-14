import { useState } from 'react'
import axios from 'axios'
import { Sparkles, Check, Loader2, ClipboardCheck } from 'lucide-react'
import { useAnalysisState } from '../context/AnalysisContext'

function SuggestionList({ suggestions, contentItemId, context = 'url' }) {
    const [fixingIndex, setFixingIndex] = useState(null)
    const [fixedResults, setFixedResults] = useState({}) // { index: 'fixed content' }
    const [appliedIndices, setAppliedIndices] = useState(new Set())
    const { updateOptimization } = useAnalysisState()

    const handleAutoFix = async (suggestion, index) => {
        if (!contentItemId) {
            alert('Cannot auto-fix without a saved content context.')
            return
        }

        setFixingIndex(index)
        try {
            const response = await axios.post('/api/auto-fix', {
                content_item_id: contentItemId,
                suggestion: suggestion.text
            })

            setFixedResults(prev => ({
                ...prev,
                [index]: response.data.optimized_content
            }))
        } catch (err) {
            alert('Auto-fix failed: ' + (err.response?.data?.detail || err.message))
        } finally {
            setFixingIndex(null)
        }
    }

    const handleApplyFix = (index) => {
        const optimized = fixedResults[index]
        if (!optimized) return

        updateOptimization({ content: optimized })
        setAppliedIndices(prev => new Set([...prev, index]))

        // Optional: Scroll to editor or show success toast
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

    // Group by priority
    const groupedSuggestions = {
        HIGH: suggestions.filter(s => s.priority === 'HIGH'),
        MEDIUM: suggestions.filter(s => s.priority === 'MEDIUM'),
        LOW: suggestions.filter(s => s.priority === 'LOW')
    }

    return (
        <div className="glass-card">
            <h2 style={{ marginBottom: '1.5rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Lightbulb size={24} color="var(--warning)" /> Optimization Suggestions
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
                            {items.map((suggestion, index) => (
                                <li key={index} style={{
                                    background: 'var(--bg-secondary)',
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-sm)',
                                    marginBottom: '0.75rem',
                                    borderLeft: `3px solid ${getPriorityColor(priority)}`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div style={{ flex: 1, minWidth: '200px' }}>
                                            <p style={{ marginBottom: '0.5rem', fontWeight: '500' }}>{suggestion.text}</p>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {suggestion.category} • {suggestion.source}
                                            </span>
                                        </div>

                                        {!fixedResults[index] ? (
                                            <button
                                                onClick={() => handleAutoFix(suggestion, index)}
                                                disabled={fixingIndex === index}
                                                className="btn btn-outline"
                                                style={{
                                                    padding: '0.4rem 0.75rem',
                                                    fontSize: '0.8rem',
                                                    gap: '0.4rem',
                                                    borderColor: 'var(--accent-primary)',
                                                    color: 'var(--text-primary)'
                                                }}
                                            >
                                                {fixingIndex === index ? (
                                                    <Loader2 size={14} className="spin" />
                                                ) : (
                                                    <Sparkles size={14} color="var(--accent-primary)" />
                                                )}
                                                {fixingIndex === index ? 'Fixing...' : '✨ Auto-Fix'}
                                            </button>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                {context === 'text' && !appliedIndices.has(index) && (
                                                    <button
                                                        onClick={() => handleApplyFix(index)}
                                                        className="btn btn-primary"
                                                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', gap: '0.4rem' }}
                                                    >
                                                        <ClipboardCheck size={14} /> Apply to Editor
                                                    </button>
                                                )}
                                                <div style={{
                                                    color: 'var(--success)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.4rem',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    padding: '0.4rem'
                                                }}>
                                                    <Check size={16} /> {appliedIndices.has(index) ? 'Applied' : 'Fixed'}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Display Fixed Content */}
                                    {fixedResults[index] && (
                                        <div style={{
                                            marginTop: '1rem',
                                            padding: '1rem',
                                            background: '#0a1d15',
                                            border: '1px solid #10b98144',
                                            borderRadius: '6px',
                                            fontSize: '0.9rem',
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase' }}>
                                                Suggested Replacement
                                            </div>
                                            {fixedResults[index]}
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
