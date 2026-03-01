function SuggestionList({ suggestions }) {
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
            case 'HIGH': return '🔴'
            case 'MEDIUM': return '🟡'
            case 'LOW': return '🟢'
            default: return '⚪'
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
            <h2 style={{ marginBottom: '1.5rem', fontFamily: 'Outfit, sans-serif' }}>
                💡 Optimization Suggestions
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ marginBottom: '0.25rem' }}>{suggestion.text}</p>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {suggestion.category} • {suggestion.source}
                                            </span>
                                        </div>
                                    </div>
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
