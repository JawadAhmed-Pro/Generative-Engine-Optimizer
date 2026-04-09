function MetricCard({ title, score, description }) {
    const getScoreClass = (score) => {
        if (score >= 75) return 'score-high'
        if (score >= 50) return 'score-medium'
        return 'score-low'
    }

    const getProgressColor = (score) => {
        if (score >= 75) return 'var(--success)'
        if (score >= 50) return 'var(--warning)'
        return 'var(--error)'
    }

    return (
        <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '0.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', margin: 0 }}>{title}</h3>
                {description && (
                   <span 
                        className="tooltip" 
                        data-tooltip={description} 
                        style={{ cursor: 'help', color: 'var(--accent-primary)', fontSize: '0.9rem', opacity: 0.8 }}
                    >
                        ⓘ
                    </span>
                )}
            </div>

            <div className={`score-badge ${getScoreClass(score)}`} style={{ marginBottom: '1rem' }}>
                {Math.round(score)}/100
            </div>

            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{
                        width: `${score}%`,
                        background: getProgressColor(score)
                    }}
                ></div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                {description}
            </p>
        </div>
    )
}

export default MetricCard
