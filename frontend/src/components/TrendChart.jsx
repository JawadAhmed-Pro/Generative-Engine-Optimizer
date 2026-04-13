import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Minus, ChevronDown } from 'lucide-react'
import axios from 'axios'

// Simple client-side cache to persist dashboard data between navigation
const trendCache = new Map();

function TrendChart({ projectId = null, limit = 10 }) {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

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
                    background: 'var(--bg-secondary)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        {label}
                    </p>
                    <p style={{ color: 'var(--accent-primary)', fontWeight: '600', fontSize: '1rem' }}>
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
        <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '0.25rem' }}>
                        Optimization Trends
                    </h3>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        padding: '0.4rem 0.75rem', 
                        borderRadius: '6px', 
                        fontSize: '0.75rem', 
                        fontWeight: '700', 
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <TrendingUp size={14} color="var(--accent-primary)" /> Interactive graph <ChevronDown size={14} />
                    </button>
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

            <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#42D4FF" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#42D4FF" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#9333EA" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#9333EA" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="4 4"
                        stroke="rgba(255,255,255,0.03)"
                        vertical={true}
                    />
                    <XAxis
                        dataKey="name"
                        stroke="var(--text-tertiary)"
                        fontSize={10}
                        fontWeight="700"
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis hide={true} />
                    <Tooltip content={<CustomTooltip />} />
                    
                    {/* Secondary Purple Layer (Mocked for 1:1 look) */}
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#9333EA"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPurple)"
                        dot={false}
                        transform="translate(0, 10)"
                    />

                    {/* Primary Blue Layer */}
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#42D4FF"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorScore)"
                        dot={{ r: 4, fill: "white", stroke: "#42D4FF", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "white", stroke: "#42D4FF", strokeWidth: 3 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

export default TrendChart
