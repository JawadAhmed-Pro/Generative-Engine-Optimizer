import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

// Simple client-side cache to persist dashboard data between navigation
const trendCache = new Map();

function TrendChart({ projectId = null, limit = 10 }) {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { isDark } = useTheme()

    useEffect(() => {
        fetchTrendData()
    }, [projectId, limit])

    const fetchTrendData = async () => {
        const endpoint = projectId
            ? `/api/projects/${projectId}/items`
            : `/api/history?limit=${limit}`

        // Check cache first
        if (trendCache.has(endpoint)) {
            setData(trendCache.get(endpoint))
            setLoading(false)
            // Still fetch in background to refresh (stale-while-revalidate)
        }

        try {
            if (!trendCache.has(endpoint)) {
                setLoading(true)
            }
            
            const response = await axios.get(endpoint)
            const items = response.data.items || response.data

            // Transform data for chart
            const chartData = items
                .filter(item => item.score)
                .reverse() // Show oldest first
                .map((item, index) => ({
                    name: new Date(item.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                    }),
                    score: parseFloat(item.score?.toFixed(1) || 0),
                    title: item.title?.substring(0, 30) || `Analysis ${index + 1}`
                }))

            trendCache.set(endpoint, chartData)
            setData(chartData)
        } catch (err) {
            console.error('Failed to fetch trend data:', err)
            if (!trendCache.has(endpoint)) {
                setError('Failed to load trend data')
            }
        } finally {
            setLoading(false)
        }
    }

    const calculateTrend = () => {
        if (data.length < 2) return { direction: 'neutral', change: 0 }
        const first = data[0]?.score || 0
        const last = data[data.length - 1]?.score || 0
        const change = last - first
        return {
            direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
            change: Math.abs(change).toFixed(1)
        }
    }

    const trend = calculateTrend()

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(15, 23, 42, 0.1)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        {label}
                    </p>
                    <p style={{ color: isDark ? 'white' : '#0F172A', fontWeight: '800', fontSize: '1.1rem' }}>
                        Score: {payload[0].value}
                    </p>
                    {payload[0].payload.title && (
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                            {payload[0].payload.title}
                        </p>
                    )}
                </div>
            )
        }
        return null
    }

    if (loading) {
        return (
            <div className="glass-card" style={{ padding: '1.5rem', minHeight: '300px' }}>
                <div className="skeleton skeleton-title" />
                <div className="skeleton" style={{ height: '200px', marginTop: '1rem' }} />
            </div>
        )
    }

    if (error || data.length === 0) {
        return (
            <div className="glass-card" style={{
                padding: '2rem',
                textAlign: 'center',
                minHeight: '300px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <TrendingUp size={40} color="var(--text-tertiary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p style={{ color: 'var(--text-secondary)' }}>
                    {error || 'No analysis data yet. Run some analyses to see trends!'}
                </p>
            </div>
        )
    }

    return (
        <div className="depth-card" style={{ 
            padding: '2rem', 
            background: isDark ? 'rgba(255,255,255,0.02)' : 'white',
            border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
            borderRadius: '16px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '900', marginBottom: '0.25rem', color: isDark ? 'white' : '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Optimization Trends
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: '600' }}>
                        Multi-layered performance analysis
                    </p>
                </div>

                {/* Trend Indicator */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: trend.direction === 'up'
                        ? 'rgba(16, 185, 129, 0.1)'
                        : trend.direction === 'down'
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'rgba(255,255,255,0.05)',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                }}>
                    {trend.direction === 'up' ? (
                        <TrendingUp size={16} color="#10B981" />
                    ) : trend.direction === 'down' ? (
                        <TrendingDown size={16} color="#EF4444" />
                    ) : (
                        <Minus size={16} color="var(--text-secondary)" />
                    )}
                    <span style={{
                        color: trend.direction === 'up'
                            ? '#10B981'
                            : trend.direction === 'down'
                                ? '#EF4444'
                                : 'var(--text-secondary)'
                    }}>
                        {trend.direction === 'neutral' ? 'Stable' : `${trend.change} pts`}
                    </span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid
                        strokeDasharray="4 4"
                        stroke={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)"}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="name"
                        stroke="var(--text-tertiary)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <YAxis
                        domain={[0, 100]}
                        stroke="var(--text-tertiary)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke={isDark ? "#94A3B8" : "#4169E1"}
                        strokeWidth={4}
                        dot={{ fill: isDark ? "#94A3B8" : "#4169E1", strokeWidth: 0, r: 4 }}
                        activeDot={{ r: 7, stroke: isDark ? "white" : "#0F172A", strokeWidth: 2, fill: isDark ? "#475569" : "#4169E1" }}
                    />
                     <defs>
                        <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={isDark ? "#94A3B8" : "#4169E1"} />
                            <stop offset="100%" stopColor={isDark ? "#475569" : "#4B0082"} />
                        </linearGradient>
                    </defs>
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default TrendChart
