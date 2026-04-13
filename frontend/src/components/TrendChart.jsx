import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
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
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                        Score Trend
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Last {data.length} analyses
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
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.05)"
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
                        stroke="var(--accent-primary)"
                        strokeWidth={3}
                        dot={{ fill: 'var(--accent-primary)', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: 'var(--accent-primary)', strokeWidth: 2, fill: 'white' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default TrendChart
