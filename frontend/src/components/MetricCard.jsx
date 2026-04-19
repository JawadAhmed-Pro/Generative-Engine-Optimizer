import { ArrowUpRight, ArrowRight, ArrowDownRight } from 'lucide-react'

function MetricCard({ title, score, description }) {
    const safeScore = typeof score === 'number' && !isNaN(score) ? score : 0;

    const getScoreClass = (score) => {
        if (score >= 75) return 'score-high'
        if (score >= 50) return 'score-medium'
        return 'score-low'
    }

    const getProgressColor = (s) => {
        if (s >= 75) return 'var(--success)'
        if (s >= 50) return 'var(--warning)'
        return 'var(--error)'
    }

    const getIcon = () => {
        if (safeScore >= 75) return <ArrowUpRight size={18} />
        if (safeScore >= 50) return <ArrowRight size={18} />
        return <ArrowDownRight size={18} />
    }

    return (
        <div className="depth-card" style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderTop: `1px solid ${getProgressColor(safeScore)}`,
            height: '100%'
        }}>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.25rem', gap: '0.75rem', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' }}>{title}</h3>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'var(--bg-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: getProgressColor(safeScore),
                        border: `1px solid ${getProgressColor(safeScore)}44`
                    }}>
                        {getIcon()}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                        {Math.round(safeScore)}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>/ 100</span>
                </div>
            </div>

            <div>
                <div className="progress-bar" style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem' }}>
                    <div
                        className="progress-fill"
                        style={{
                            height: '100%',
                            width: `${safeScore}%`,
                            background: getProgressColor(safeScore),
                            boxShadow: `0 0 10px ${getProgressColor(safeScore)}22`,
                            transition: 'width 1s ease-out'
                        }}
                    ></div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                    {description}
                </p>
            </div>
        </div>
    )
}

export default MetricCard
