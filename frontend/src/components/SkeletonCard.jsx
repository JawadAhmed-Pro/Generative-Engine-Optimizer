import { motion } from 'framer-motion'

// Skeleton base component
function Skeleton({ width = '100%', height = '1rem', borderRadius = '4px', className = '' }) {
    return (
        <div
            className={`skeleton ${className}`}
            style={{
                width,
                height,
                borderRadius
            }}
        />
    )
}

// Skeleton for stat cards on dashboard
export function SkeletonStatCard() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card"
            style={{ padding: '1.5rem' }}
        >
            <Skeleton width="40%" height="0.75rem" />
            <Skeleton width="60%" height="2rem" borderRadius="6px" className="mt-3" />
            <Skeleton width="30%" height="0.75rem" className="mt-2" />
        </motion.div>
    )
}

// Skeleton for project cards
export function SkeletonProjectCard() {
    return (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <Skeleton width="50%" height="1.25rem" />
                <Skeleton width="60px" height="24px" borderRadius="12px" />
            </div>
            <Skeleton width="80%" height="0.875rem" />
            <Skeleton width="40%" height="0.75rem" className="mt-3" />
        </div>
    )
}

// Skeleton for history list items
export function SkeletonHistoryItem() {
    return (
        <div style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
            <Skeleton width="70%" height="1rem" />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <Skeleton width="80px" height="0.75rem" />
                <Skeleton width="60px" height="0.75rem" />
            </div>
        </div>
    )
}

// Skeleton for analysis results
export function SkeletonResultsPanel() {
    return (
        <div className="animate-fade-in">
            {/* Score cards skeleton */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-card" style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <Skeleton width="40%" height="0.875rem" />
                            <Skeleton width="40px" height="40px" borderRadius="50%" />
                        </div>
                        <Skeleton width="60px" height="2rem" />
                    </div>
                ))}
            </div>

            {/* Suggestions skeleton */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
                <Skeleton width="30%" height="1.25rem" />
                <div style={{ marginTop: '1rem' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ marginBottom: '1rem' }}>
                            <Skeleton width="100%" height="0.875rem" />
                            <Skeleton width="90%" height="0.875rem" className="mt-1" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// Skeleton for content area
export function SkeletonContent({ lines = 5 }) {
    return (
        <div>
            {Array.from({ length: lines }, (_, i) => (
                <Skeleton
                    key={i}
                    width={`${Math.random() * 40 + 60}%`}
                    height="0.875rem"
                    className="mt-2"
                />
            ))}
        </div>
    )
}

export default Skeleton
