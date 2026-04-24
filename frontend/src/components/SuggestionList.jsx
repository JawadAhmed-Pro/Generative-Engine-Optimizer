import { Lightbulb, Circle } from 'lucide-react'
import { useAnalysisState } from '../context/AnalysisContext'

function SuggestionList({ suggestions, contentItemId, context = 'url' }) {
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

    // Normalize suggestions to handle both objects and simple strings
    const normalizedSuggestions = suggestions.map(s => {
        if (typeof s === 'string') {
            return {
                text: s,
                priority: 'MEDIUM',
                category: 'General',
                source: 'AI Engine'
            }
        }
        return s
    })

    // Group by priority
    const groupedSuggestions = {
        HIGH: normalizedSuggestions.filter(s => s?.priority === 'HIGH'),
        MEDIUM: normalizedSuggestions.filter(s => s?.priority === 'MEDIUM'),
        LOW: normalizedSuggestions.filter(s => s?.priority === 'LOW')
    }

    return (
        <div className="glass-card" style={{ padding: '2rem' }}>
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
                            {items.map((suggestion, index) => (
                                <li key={index} style={{
                                    background: 'var(--bg-secondary)',
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-sm)',
                                    marginBottom: '0.75rem',
                                    borderLeft: `3px solid ${getPriorityColor(priority)}`
                                }}>
                                    <p style={{ marginBottom: '0.5rem', fontWeight: '500' }}>{suggestion.text}</p>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {suggestion.category} • {suggestion.source}
                                    </span>
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
