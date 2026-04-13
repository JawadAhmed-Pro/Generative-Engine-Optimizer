import React, { useState, useEffect, useRef } from 'react'
import { Search, FileText, Zap, CheckCircle, XCircle, AlertTriangle, RefreshCw, BookOpen, ShoppingCart, Info, Sparkles, Tag, Globe, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function AISimulator() {
    const [query, setQuery] = useState('')
    const [content, setContent] = useState('')
    const [domain, setDomain] = useState('blog')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const [validationResult, setValidationResult] = useState(null)
    const [isValidating, setIsValidating] = useState(false)
    const resultRef = useRef(null)

    // Scroll to results when they appear
    useEffect(() => {
        if (result && resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [result]);

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

    const handleValidate = async () => {
        if (!content.trim()) return
        setIsValidating(true)
        setValidationResult(null)
        try {
            const response = await axios.post('/api/validate-citation', {
                content: content,
                content_type: domain === 'blog' ? 'general' : domain
            })
            setValidationResult(response.data)
        } catch (err) {
            console.error('Validation failed:', err)
            setError('Real-world validation failed. Please try again.')
        } finally {
            setIsValidating(false)
        }
    }

    return (
        <motion.div 
            key="ai-simulator-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="simulator-container"
        >
                {/* Header Area */}
                <div style={{ marginBottom: '2rem' }}>
                    
                    {/* Title Group */}
                    <div style={{ marginTop: '0', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <Sparkles size={24} color="var(--accent-primary)" />
                            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                                GEO Perception Layer
                            </span>
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.04em' }}>
                            AI Perception Simulator
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '800px', margin: 0 }}>
                            Understand how LLMs parse your content and calculate citation probability before you publish.
                        </p>
                    </div>

                    {/* Segmented Domain Selector - Centered Below Title */}
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <div style={{ 
                            background: 'rgba(255,255,255,0.03)', 
                            padding: '4px', 
                            borderRadius: '12px', 
                            display: 'flex', 
                            border: '1px solid rgba(255,255,255,0.08)',
                            height: 'fit-content'
                        }}>
                            <button
                                onClick={() => setDomain('blog')}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: domain === 'blog' ? 'var(--accent-primary)' : 'transparent',
                                    color: domain === 'blog' ? 'white' : 'var(--text-secondary)',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                <Globe size={16} /> General / Blog
                            </button>
                            <button
                                onClick={() => setDomain('education')}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: domain === 'education' ? 'var(--accent-primary)' : 'transparent',
                                    color: domain === 'education' ? 'white' : 'var(--text-secondary)',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                <BookOpen size={16} /> Education
                            </button>
                            <button
                                onClick={() => setDomain('ecommerce')}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: domain === 'ecommerce' ? 'var(--accent-primary)' : 'transparent',
                                    color: domain === 'ecommerce' ? 'white' : 'var(--text-secondary)',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                <ShoppingCart size={16} /> E-commerce
                            </button>
                        </div>
                    </div>
                </div>

            <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '1.5rem',
                alignItems: 'stretch'
            }}>
                {/* Primary Column - Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    
                    {/* Input Group */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="depth-card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '8px', 
                                    background: domain === 'ecommerce' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                }}>
                                    {domain === 'blog' ? (
                                        <FileText size={18} color="var(--accent-primary)" />
                                    ) : domain === 'education' ? (
                                        <Search size={18} color="var(--accent-primary)" />
                                    ) : (
                                        <ShoppingCart size={18} color="var(--success)" />
                                    )}
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                                    {domain === 'blog' ? 'Topic Overview' : domain === 'education' ? 'User Question' : 'Product Inquiry'}
                                </h3>
                            </div>
                            
                            <textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={domain === 'blog'
                                    ? "e.g., Why is meditation important for mental clarity?"
                                    : domain === 'education'
                                    ? "e.g., What are the best study techniques for exams?"
                                    : "e.g., Which smartphone has the best battery life under $600?"}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '10px',
                                    color: 'var(--text-primary)',
                                    fontSize: '1.05rem',
                                    outline: 'none',
                                    minHeight: '80px',
                                    resize: 'none',
                                    transition: 'border-color 0.3s ease',
                                    fontFamily: 'inherit'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                            />
                        </div>

                        <div className="depth-card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '8px', 
                                    background: domain === 'blog' ? 'rgba(59, 130, 246, 0.1)' : domain === 'education' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(236, 72, 153, 0.1)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                }}>
                                    {domain === 'ecommerce' ? (
                                        <Tag size={18} color="#ec4899" />
                                    ) : (
                                        <FileText size={18} color={domain === 'blog' ? 'var(--accent-primary)' : 'var(--accent-secondary)'} />
                                    )}
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                                    {domain === 'blog' ? 'Blog Content' : domain === 'education' ? 'Target Content' : 'Product Description'}
                                </h3>
                            </div>
                            
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder={domain === 'blog'
                                    ? "Paste your blog post, article draft, or creative piece here. We will analyze the storytelling impact and informational depth..."
                                    : domain === 'education' 
                                    ? "Paste your article or content here. The simulator will analyze how an LLM would extract facts from this specific text..."
                                    : "Paste your product listing, specifications, or pricing details here. We will analyze the purchase intent and technical authority..."}
                                style={{
                                    width: '100%',
                                    minHeight: '400px',
                                    padding: '1.25rem',
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '10px',
                                    color: 'var(--text-primary)',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '0.95rem',
                                    lineHeight: '1.6',
                                    resize: 'vertical',
                                    outline: 'none',
                                    transition: 'border-color 0.3s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-secondary)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button
                                onClick={handleSimulate}
                                disabled={loading || !query.trim() || !content.trim()}
                                className="btn btn-primary"
                                style={{ 
                                    flex: 1,
                                    padding: '1.1rem',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.8rem',
                                    borderRadius: '12px',
                                    background: 'var(--accent-gradient)',
                                    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw size={20} className="spin" /> 
                                        <span>Running Deep Intelligence Analysis...</span>
                                    </>
                                ) : (
                                    <>
                                        <Zap size={20} fill="currentColor" /> 
                                        <span>Execute Simulation</span>
                                    </>
                                )}
                                {!loading && <div className="shimmer-effect" />}
                            </button>

                            <button
                                onClick={handleValidate}
                                disabled={isValidating || !content.trim()}
                                className="btn btn-outline"
                                style={{ 
                                    padding: '1rem 1.5rem',
                                    fontSize: '0.95rem',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(16, 185, 129, 0.4)',
                                    color: '#10b981',
                                    background: 'rgba(16, 185, 129, 0.05)',
                                    cursor: (isValidating || !content.trim()) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isValidating ? <RefreshCw size={18} className="spin" /> : <CheckCircle size={18} />}
                                {isValidating ? 'Validating...' : 'Run Live Proof'}
                            </button>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{
                                    marginTop: '1.25rem',
                                    padding: '1rem',
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    borderRadius: '10px',
                                    color: 'var(--error)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    fontSize: '0.95rem'
                                }}
                            >
                                <AlertTriangle size={20} />
                                {error}
                            </motion.div>
                        )}

                        <AnimatePresence>
                            {validationResult && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    style={{ marginTop: '1.5rem' }}
                                >
                                    <div className="glass-card" style={{ 
                                        padding: '1.5rem', 
                                        border: `1px solid ${validationResult.threshold_met ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                                        background: validationResult.threshold_met ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(0,0,0,0.2) 100%)' : 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(0,0,0,0.2) 100%)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                {validationResult.threshold_met ? (
                                                    <Trophy size={24} color="#10b981" />
                                                ) : (
                                                    <AlertTriangle size={24} color="#f59e0b" />
                                                )}
                                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>
                                                    {validationResult.threshold_met ? 'Extraction Verification Success' : 'Extraction Threshold Warning'}
                                                </h3>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Probability</div>
                                                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: validationResult.threshold_met ? '#10b981' : '#f59e0b' }}>
                                                    {validationResult.probability.toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.5' }}>
                                            {validationResult.threshold_met 
                                                ? "Outstanding. Your content architecture has crossed the required threshold. AI agents like Perplexity and SearchGPT are highly likely to extract and cite this content."
                                                : "Warning: Low extraction probability. AI agents may struggle to parse this content as authoritative. Use the Content Optimizer to injection missing structural elements."}
                                        </p>
                                        <button 
                                            onClick={() => setValidationResult(null)}
                                            style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline', padding: 0 }}
                                        >
                                            Dismiss Result
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Results Section - Now Flows Vertically */}
                <div style={{ marginTop: '0.5rem' }}>
                    <AnimatePresence mode="wait">
                        {!result && !loading && (
                            <motion.div 
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="depth-card" 
                                style={{
                                    padding: '2.5rem 1.5rem',
                                    textAlign: 'center',
                                    minHeight: '400px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderStyle: 'dashed',
                                    background: 'rgba(255,255,255,0.01)'
                                }}
                            >
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '2rem',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <RefreshCw size={32} color="var(--text-tertiary)" />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Simulation Pending</h3>
                                <p style={{ color: 'var(--text-secondary)', maxWidth: '300px', lineHeight: '1.6' }}>
                                    Configure your content and query parameters to begin the perception analysis.
                                </p>
                            </motion.div>
                        )}

                        {loading && (
                            <motion.div 
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="depth-card" 
                                style={{
                                    padding: '2.5rem 1.5rem',
                                    textAlign: 'center',
                                    minHeight: '400px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <div className="loading-container" style={{ marginBottom: '2.5rem' }}>
                                    <div className="pulse-ring" />
                                    <RefreshCw size={48} color="var(--accent-primary)" className="spin" />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    {domain === 'blog' ? 'Evaluating Storytelling Impact' : domain === 'education' ? 'Parsing Content Structure' : 'Evaluating Product Authority'}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', maxWidth: '320px' }}>
                                    {domain === 'blog'
                                        ? 'Evaluating narrative flow, structural engagement, and audience relevance...'
                                        : domain === 'education' 
                                        ? 'The simulation is currently evaluating semantic relevance and authority signals...' 
                                        : 'Evaluating product specifications, competitive edge, and citation readiness...'}
                                </p>
                            </motion.div>
                        )}

                        {result && (
                            <motion.div 
                                ref={resultRef}
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="depth-card" 
                                style={{ 
                                    padding: 0, 
                                    overflow: 'hidden',
                                    border: `1px solid ${result.would_cite ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                                }}
                            >
                                {/* Status Header Banner */}
                                <div style={{
                                    padding: '1.25rem 1.5rem',
                                    background: result.would_cite 
                                        ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.2) 0%, transparent 100%)' 
                                        : 'linear-gradient(90deg, rgba(245, 158, 11, 0.2) 0%, transparent 100%)',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.25rem'
                                }}>
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '16px',
                                        background: result.would_cite ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: result.would_cite ? '0 0 20px rgba(16, 185, 129, 0.2)' : '0 0 20px rgba(245, 158, 11, 0.2)'
                                    }}>
                                        {result.would_cite ? (
                                            <CheckCircle size={28} color="var(--success)" />
                                        ) : (
                                            <AlertTriangle size={28} color="var(--warning)" />
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                            <h3 style={{ 
                                                fontSize: '1.25rem', 
                                                fontWeight: '800',
                                                color: result.would_cite ? 'var(--success)' : 'var(--warning)'
                                            }}>
                                                {result.would_cite ? 'High Citation Probability' : 'Low Visibility Potential'}
                                            </h3>
                                            <div style={{ 
                                                padding: '0.2rem 0.6rem', 
                                                borderRadius: '100px', 
                                                background: result.would_cite ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                fontSize: '0.75rem',
                                                fontWeight: '700',
                                                color: result.would_cite ? 'var(--success)' : 'var(--warning)',
                                                border: `1px solid ${result.would_cite ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                                            }}>
                                                {result.confidence}% Match
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            {result.would_cite 
                                                ? (domain === 'blog' ? 'Article demonstrates strong narrative depth and informational value.' : domain === 'education' ? 'Target content contains sufficient semantic richness.' : 'Product listing displays high technical authority and trust.') 
                                                : (domain === 'blog' ? 'Narrative structure lacks technical depth or engagement hooks.' : domain === 'education' ? 'Critical information gaps detected in content structure.' : 'Product details lack critical comparison points or specs.')}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {/* AI Prediction */}
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                            <Zap size={16} color="var(--accent-primary)" />
                                            <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                Simulated AI Response
                                            </h4>
                                        </div>
                                        <div className="markdown-content" style={{ 
                                            padding: '1.5rem', 
                                            background: 'rgba(0,0,0,0.25)', 
                                            borderRadius: '12px',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.03)',
                                            fontSize: '0.95rem',
                                            lineHeight: '1.7'
                                        }}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {result.ai_response}
                                            </ReactMarkdown>
                                        </div>
                                    </div>

                                    {/* Optimization Insights - Vertically Stacked */}
                                    <div style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        gap: '1.5rem' 
                                    }}>
                                        {result.gaps && result.gaps.length > 0 && (
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                                    <XCircle size={16} color="var(--warning)" />
                                                    <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                        Identified Gaps
                                                    </h4>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                    {result.gaps.map((gap, idx) => (
                                                        <div key={idx} style={{ 
                                                            display: 'flex', 
                                                            gap: '0.6rem', 
                                                            fontSize: '0.85rem', 
                                                            color: 'var(--text-secondary)',
                                                            padding: '0.65rem 0.85rem',
                                                            background: 'rgba(245, 158, 11, 0.03)',
                                                            borderRadius: '8px',
                                                            border: '1px solid rgba(245, 158, 11, 0.1)'
                                                        }}>
                                                            <div style={{ minWidth: '4px', height: '18px', background: 'var(--warning)', borderRadius: '2px', marginTop: '2px' }} />
                                                            {gap}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {result.suggestions && result.suggestions.length > 0 && (
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                                    <CheckCircle size={16} color="var(--accent-primary)" />
                                                    <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                        Strategic Suggestions
                                                    </h4>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                    {result.suggestions.map((sug, idx) => (
                                                        <div key={idx} style={{ 
                                                            display: 'flex', 
                                                            gap: '0.6rem', 
                                                            fontSize: '0.85rem', 
                                                            color: 'var(--text-primary)',
                                                            padding: '0.65rem 0.85rem',
                                                            background: 'rgba(59, 130, 246, 0.03)',
                                                            borderRadius: '8px',
                                                            border: '1px solid rgba(59, 130, 246, 0.1)'
                                                        }}>
                                                            <div style={{ minWidth: '4px', height: '18px', background: 'var(--accent-primary)', borderRadius: '2px', marginTop: '2px' }} />
                                                            {sug}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* In-view Styles (Simulated for this component) */}
            <style>{`
                .shimmer-effect {
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 50%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.1),
                        transparent
                    );
                    animation: shimmer-swipe 3s infinite;
                }

                @keyframes shimmer-swipe {
                    0% { left: -100%; }
                    100% { left: 200%; }
                }

                .loading-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .pulse-ring {
                    position: absolute;
                    width: 80px;
                    height: 80px;
                    border: 2px solid var(--accent-primary);
                    border-radius: 50%;
                    animation: ring-pulse 2s infinite;
                }

                @keyframes ring-pulse {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    100% { transform: scale(1.5); opacity: 0; }
                }

                .markdown-content ul li {
                    margin-bottom: 0.75rem;
                    color: var(--text-secondary);
                }

                .simulator-container textarea::-webkit-scrollbar {
                    width: 4px;
                }
                
                .simulator-container textarea::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                }
            `}</style>
        </motion.div>
    )
}

export default AISimulator
