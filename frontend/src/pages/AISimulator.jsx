import { useState } from 'react'
import { Search, FileText, Zap, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function AISimulator() {
    const [query, setQuery] = useState('')
    const [content, setContent] = useState('')
    const [domain, setDomain] = useState('education') // 'education' or 'ecommerce'
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)

    const handleSimulate = async () => {
        if (!query.trim() || !content.trim()) return

        setLoading(true)
        setError(null)
        setResult(null)

        try {
            const response = await axios.post('/api/simulate-ai', {
                query: query,
                content: content,
                domain: domain
            })
            setResult(response.data)
        } catch (err) {
            setError(err.response?.data?.detail || 'Simulation failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                    AI Perception Simulator
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Test if AI search engines would cite your content
                </p>
            </div>

            {/* Domain Selector */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => setDomain('education')}
                    className={`btn ${domain === 'education' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ gap: '0.5rem' }}
                >
                    📚 Education
                </button>
                <button
                    onClick={() => setDomain('ecommerce')}
                    className={`btn ${domain === 'ecommerce' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ gap: '0.5rem' }}
                >
                    🛒 E-commerce
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Left Column - Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Query Input */}
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Search size={20} color="var(--accent-primary)" />
                            <h3 style={{ fontWeight: '600' }}>User Query</h3>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            What question would a user ask an AI?
                        </p>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={domain === 'education'
                                ? "e.g., What are the best study techniques for exams?"
                                : "e.g., What is the best laptop under 200,000 PKR?"}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Content Input */}
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <FileText size={20} color="var(--accent-primary)" />
                            <h3 style={{ fontWeight: '600' }}>Your Content</h3>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Paste the content you want to test
                        </p>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Paste your article, product description, or content here..."
                            style={{
                                width: '100%',
                                minHeight: '250px',
                                padding: '1rem',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontFamily: 'Inter, sans-serif',
                                resize: 'vertical',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Simulate Button */}
                    <button
                        onClick={handleSimulate}
                        disabled={loading || !query.trim() || !content.trim()}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                    >
                        {loading ? (
                            <>
                                <RefreshCw size={20} className="spin" /> Simulating...
                            </>
                        ) : (
                            <>
                                <Zap size={20} /> Run AI Simulation
                            </>
                        )}
                    </button>

                    {error && (
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid var(--error)',
                            borderRadius: '8px',
                            color: 'var(--error)'
                        }}>
                            {error}
                        </div>
                    )}
                </div>

                {/* Right Column - Results */}
                <div>
                    {!result && !loading && (
                        <div className="glass-card" style={{
                            padding: '3rem',
                            textAlign: 'center',
                            minHeight: '400px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem'
                            }}>
                                <Search size={32} color="var(--text-secondary)" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Ready to Simulate</h3>
                            <p style={{ color: 'var(--text-secondary)', maxWidth: '280px' }}>
                                Enter a user query and your content to see if AI would cite your content.
                            </p>
                        </div>
                    )}

                    {loading && (
                        <div className="glass-card" style={{
                            padding: '3rem',
                            textAlign: 'center',
                            minHeight: '400px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <div className="spin" style={{ marginBottom: '1rem' }}>
                                <RefreshCw size={48} color="var(--accent-primary)" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Asking AI...</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Simulating how AI would answer this query
                            </p>
                        </div>
                    )}

                    {result && (
                        <div className="glass-card animate-fade-in" style={{ padding: '1.5rem' }}>
                            {/* Citation Status */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                background: result.would_cite
                                    ? 'rgba(16, 185, 129, 0.1)'
                                    : 'rgba(245, 158, 11, 0.1)',
                                borderRadius: '8px',
                                marginBottom: '1.5rem'
                            }}>
                                {result.would_cite ? (
                                    <CheckCircle size={32} color="var(--success)" />
                                ) : (
                                    <AlertTriangle size={32} color="var(--warning)" />
                                )}
                                <div>
                                    <h3 style={{
                                        fontSize: '1.1rem',
                                        fontWeight: '600',
                                        color: result.would_cite ? 'var(--success)' : 'var(--warning)'
                                    }}>
                                        {result.would_cite ? 'Content Would Be Cited' : 'Content Unlikely to Be Cited'}
                                    </h3>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        Confidence: {result.confidence}%
                                    </p>
                                </div>
                            </div>

                            {/* AI Response Preview */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>
                                    How AI Would Answer:
                                </h4>
                                <div className="markdown-content" style={{
                                    padding: '1rem',
                                    background: 'rgba(0,0,0,0.2)',
                                    borderRadius: '8px',
                                    maxHeight: '200px',
                                    overflowY: 'auto'
                                }}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {result.ai_response}
                                    </ReactMarkdown>
                                </div>
                            </div>

                            {/* Gap Analysis */}
                            {result.gaps && result.gaps.length > 0 && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontWeight: '600', marginBottom: '0.75rem', color: 'var(--warning)' }}>
                                        Why Not Cited (Gaps):
                                    </h4>
                                    <ul style={{ paddingLeft: '1.25rem' }}>
                                        {result.gaps.map((gap, idx) => (
                                            <li key={idx} style={{
                                                marginBottom: '0.5rem',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                {gap}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Suggestions */}
                            {result.suggestions && result.suggestions.length > 0 && (
                                <div>
                                    <h4 style={{ fontWeight: '600', marginBottom: '0.75rem', color: 'var(--accent-primary)' }}>
                                        Recommendations:
                                    </h4>
                                    <ul style={{ paddingLeft: '1.25rem' }}>
                                        {result.suggestions.map((sug, idx) => (
                                            <li key={idx} style={{
                                                marginBottom: '0.5rem',
                                                color: 'var(--text-primary)'
                                            }}>
                                                {sug}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AISimulator
