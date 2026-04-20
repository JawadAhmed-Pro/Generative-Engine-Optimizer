import { useState, useEffect } from 'react'
import axios from 'axios'
import { Sparkles, FileText, List, Lightbulb } from 'lucide-react'

function RAGInsights({ contentItemId, initialInsights = [] }) {
    // If we have initial insights, default to explanation, otherwise show landing (null)
    const [activeTab, setActiveTab] = useState(() => {
        if (initialInsights && initialInsights.some(i => i.type === 'explanation')) {
            return 'explanation'
        }
        return null
    })

    // Initialize state from props if available
    const [insights, setInsights] = useState(() => {
        const initialState = {
            explanation: null,
            recommendations: null,
            rewrite: null
        }
        if (initialInsights && Array.isArray(initialInsights)) {
            initialInsights.forEach(item => {
                if (item.type && ['explanation', 'recommendations', 'rewrite'].includes(item.type)) {
                    initialState[item.type] = item.content
                }
            })
        }
        return initialState
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchInsight = async (type) => {
        if (insights[type]) return

        setLoading(true)
        setError(null)
        try {
            const response = await axios.post('/api/generate-insights', {
                content_item_id: contentItemId,
                insight_type: type
            })
            setInsights(prev => ({
                ...prev,
                [type]: response.data.insights
            }))
        } catch (err) {
            console.error(err)
            setError(err.response?.data?.detail || err.message || 'Failed to generate insights')
        } finally {
            setLoading(false)
        }
    }

    const handleTabChange = (type) => {
        setActiveTab(type)
        fetchInsight(type)
    }

    // Landing view with buttons
    if (!activeTab && !loading) {
        return (
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                    className="btn btn-primary"
                    onClick={() => handleTabChange('explanation')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Lightbulb size={18} /> Get Analysis Explanation
                </button>
                <button
                    className="btn btn-outline"
                    onClick={() => handleTabChange('recommendations')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <List size={18} /> Generate Strategic Plan
                </button>
            </div>
        )
    }

    return (
        <div className="glass-card" style={{ marginTop: '2rem', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Sparkles size={24} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                <h2 style={{ fontFamily: 'inherit', fontSize: '1.25rem', margin: 0 }}>
                    AI Strategic Insights
                </h2>
            </div>

            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                overflowX: 'auto'
            }}>
                <button
                    onClick={() => handleTabChange('explanation')}
                    style={tabStyle(activeTab === 'explanation')}
                >
                    <Lightbulb size={16} /> Analysis Explanation
                </button>
                <button
                    onClick={() => handleTabChange('recommendations')}
                    style={tabStyle(activeTab === 'recommendations')}
                >
                    <List size={16} /> Strategic Plan
                </button>
                <button
                    onClick={() => handleTabChange('rewrite')}
                    style={tabStyle(activeTab === 'rewrite')}
                >
                    <FileText size={16} /> Content Rewrites
                </button>
            </div>

            <div style={{ minHeight: '150px', maxWidth: '100%', overflow: 'hidden' }}>
                {loading && (!insights[activeTab] || activeTab === null) ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '3rem',
                        color: 'var(--text-secondary)'
                    }}>
                        <div className="loading-spinner" style={{ marginRight: '0.75rem' }}></div>
                        Consulting knowledge base...
                    </div>
                ) : error ? (
                    <div style={{
                        padding: '1.5rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid var(--error)',
                        borderRadius: '0.5rem',
                        color: 'var(--error)'
                    }}>
                        {error}
                    </div>
                ) : (
                    <div className="markdown-content" style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                        lineHeight: '1.6',
                        color: 'var(--text-primary)',
                        fontSize: '0.95rem',
                        maxWidth: '100%',
                        overflow: 'hidden'
                    }}>
                        {insights[activeTab]}
                    </div>
                )}
            </div>
        </div>
    )
}

const tabStyle = (isActive) => ({
    background: 'none',
    border: 'none',
    borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: isActive ? '600' : '400',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    flexShrink: 0
})

export default RAGInsights
