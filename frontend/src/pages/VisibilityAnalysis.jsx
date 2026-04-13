import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Link as LinkIcon, Info, Folder, Plus, X, Sparkles, BookOpen, ShoppingCart, Tag, History, Target, ChevronDown, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import ResultsPanel from '../components/ResultsPanel'
import AnalysisModal from '../components/AnalysisModal'
import { useAnalysisState } from '../context/AnalysisContext'

function VisibilityAnalysis() {
    const [searchParams] = useSearchParams()
    const projectFromUrl = searchParams.get('project')

    // Use context for persistent state
    const { visibilityState, updateVisibility } = useAnalysisState()
    const { url, contentType, analysisResults, selectedProject: contextProject } = visibilityState

    // Local-only state (doesn't need persistence)
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [history, setHistory] = useState([])
    const [selectedProject, setSelectedProject] = useState(projectFromUrl || contextProject || '')

    // Create project state
    const [showCreateProject, setShowCreateProject] = useState(false)
    const [newProjectName, setNewProjectName] = useState('')
    const [creatingProject, setCreatingProject] = useState(false)
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null)

    // Sync selectedProject back to context
    useEffect(() => {
        updateVisibility({ selectedProject })
    }, [selectedProject])

    useEffect(() => {
        fetchHistory()
        fetchProjects()
    }, [])

    const fetchHistory = async () => {
        try {
            const response = await axios.get('/api/history?type=url&limit=5')
            setHistory(response.data.items)
        } catch (error) {
            console.error('Failed to fetch history:', error)
        }
    }

    const fetchProjects = async () => {
        try {
            const response = await axios.get('/api/projects')
            setProjects(response.data)
        } catch (error) {
            console.error('Failed to fetch projects:', error)
        }
    }

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return

        setCreatingProject(true)
        try {
            const response = await axios.post('/api/projects', {
                name: newProjectName,
                description: 'Created from Visibility Analysis'
            })
            await fetchProjects()
            setSelectedProject(response.data.id.toString())
            setNewProjectName('')
            setShowCreateProject(false)
        } catch (err) {
            alert('Failed to create project')
        } finally {
            setCreatingProject(false)
        }
    }

    const handleAnalyze = async () => {
        if (!url.trim()) return

        setLoading(true)
        setError(null)
        updateVisibility({ analysisResults: null })

        try {
            const response = await axios.post('/api/analyze-url', {
                url: url,
                content_type: contentType,
                project_id: selectedProject ? parseInt(selectedProject) : null
            })
            updateVisibility({ analysisResults: response.data })
            fetchHistory() // Refresh history
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Analysis failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="animate-fade-in">
            {/* Header Area */}
            <div style={{ marginBottom: '2rem' }}>
                {/* Title Group */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Sparkles size={24} color="var(--accent-primary)" />
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                            GEO Perception Layer
                        </span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.04em' }}>
                        Visibility Analysis
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '800px', margin: 0 }}>
                        Analyze how AI search engines perceive and cite your public content.
                    </p>
                </div>

                {/* Segmented Domain Selector - Centered for Suite Consistency */}
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <div style={{ 
                        display: 'inline-flex', 
                        background: 'rgba(255,255,255,0.03)', 
                        padding: '4px', 
                        borderRadius: '12px', 
                        border: '1px solid rgba(255,255,255,0.08)',
                        gap: '4px'
                    }}>
                        {[
                            { id: 'general', label: 'General / Blog', icon: <Globe size={16} /> },
                            { id: 'educational', label: 'Education', icon: <BookOpen size={16} /> },
                            { id: 'ecommerce', label: 'E-commerce', icon: <ShoppingCart size={16} /> }
                        ].map(domain => (
                            <button
                                key={domain.id}
                                onClick={() => updateVisibility({ contentType: domain.id })}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: contentType === domain.id ? 'var(--accent-primary)' : 'transparent',
                                    color: contentType === domain.id ? 'white' : 'var(--text-secondary)',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                {domain.icon} {domain.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>


            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                {/* Left Column - Input */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="depth-card" style={{ padding: '2rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                        {/* Decorative side accent */}
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'var(--accent-gradient)' }} />
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Target URL Group - Specialized per Domain */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                                    {contentType === 'general' ? (
                                        <LinkIcon size={18} color="var(--accent-primary)" />
                                    ) : contentType === 'educational' ? (
                                        <BookOpen size={18} color="var(--accent-secondary)" />
                                    ) : (
                                        <ShoppingCart size={18} color="var(--success)" />
                                    )}
                                    <span style={{ fontWeight: '700', fontSize: '0.95rem', letterSpacing: '0.02em' }}>
                                        {contentType === 'general' ? 'Target URL' : contentType === 'educational' ? 'Educational Resource URL' : 'Product Page URL'}
                                    </span>
                                </div>
                                
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => updateVisibility({ url: e.target.value })}
                                        placeholder={contentType === 'general' 
                                            ? "https://www.example.com/blog/article-slug" 
                                            : contentType === 'educational'
                                            ? "https://university.edu/course/machine-learning-101"
                                            : "https://store.com/products/wireless-headphones-v2"}
                                        style={{
                                            width: '100%',
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '10px',
                                            padding: '1rem 1.25rem',
                                            color: 'var(--text-primary)',
                                            fontFamily: 'Inter, sans-serif',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            transition: 'border-color 0.2s'
                                        }}
                                        className="focus-ring"
                                    />
                                </div>
                                <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                    <Info size={14} />
                                    {contentType === 'general' 
                                        ? "Enter the full public URL of the page you want to analyze for AI citation readiness."
                                        : contentType === 'educational'
                                        ? "Enter the URL of the academic article or educational resource to audit its authority in LLM training sets."
                                        : "Enter the product listing URL to analyze its referral probability in AI shopping assistants."}
                                </div>
                            </div>

                            {/* Project Selector Group */}
                            <div style={{ paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                                    <Folder size={18} color="var(--accent-secondary)" />
                                    <span style={{ fontWeight: '700', fontSize: '0.95rem', letterSpacing: '0.02em' }}>Assign to Project</span>
                                </div>

                                {showCreateProject ? (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: '0.75rem' }}>
                                        <input
                                            type="text"
                                            value={newProjectName}
                                            onChange={(e) => setNewProjectName(e.target.value)}
                                            placeholder="Enter project name..."
                                            autoFocus
                                            style={{
                                                flex: 1,
                                                background: 'rgba(0,0,0,0.4)',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                color: 'var(--text-primary)',
                                                padding: '0.75rem 1rem',
                                                borderRadius: '8px',
                                                outline: 'none',
                                                fontSize: '0.9rem'
                                            }}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                                        />
                                        <button
                                            onClick={handleCreateProject}
                                            disabled={creatingProject || !newProjectName.trim()}
                                            className="btn btn-primary"
                                            style={{ padding: '0 1.5rem', borderRadius: '8px' }}
                                        >
                                            {creatingProject ? '...' : 'Create'}
                                        </button>
                                        <button
                                            onClick={() => { setShowCreateProject(false); setNewProjectName(''); }}
                                            className="btn btn-outline"
                                            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                                        >
                                            <X size={18} />
                                        </button>
                                    </motion.div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <div style={{ position: 'relative', flex: 1 }}>
                                            <select
                                                value={selectedProject}
                                                onChange={(e) => setSelectedProject(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    background: 'rgba(0,0,0,0.4)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    color: 'var(--text-primary)',
                                                    padding: '0.75rem 2.5rem 0.75rem 1rem',
                                                    borderRadius: '8px',
                                                    outline: 'none',
                                                    fontSize: '0.94rem',
                                                    cursor: 'pointer',
                                                    appearance: 'none',
                                                    WebkitAppearance: 'none'
                                                }}
                                            >
                                                <option value="">No project (standalone)</option>
                                                {projects.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                            <div style={{
                                                position: 'absolute',
                                                right: '1rem',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                pointerEvents: 'none',
                                                color: 'var(--text-secondary)',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}>
                                                <ChevronDown size={16} />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowCreateProject(true)}
                                            className="btn btn-outline"
                                            style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                                            title="Create new project"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !url.trim()}
                        className="btn btn-primary"
                        style={{ 
                            width: '100%', 
                            padding: '1.25rem', 
                            marginTop: 'auto',
                            background: 'var(--accent-gradient)',
                            border: 'none',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            gap: '0.75rem',
                            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.2)'
                        }}
                    >
                        {loading ? 'Initializing Analysis...' : <><Search size={22} /> Run Visibility Audit</>}
                    </button>

                    {error && (
                        <div style={{ marginBottom: '2rem', color: 'var(--error)', fontSize: '0.9rem' }}>
                            Error: {error}
                        </div>
                    )}

                </div>

                {/* Right Column - Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* History Panel - Matches Content Optimization Style */}
                    <div className="depth-card" style={{ padding: '0', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{
                            padding: '1.25rem 1.5rem',
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(255,255,255,0.02)'
                        }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                ANALYSIS HISTORY
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '700' }}>
                                {history.length}
                            </span>
                        </div>
                        {history.length === 0 ? (
                            <div style={{ padding: '4.5rem 2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <History size={24} style={{ opacity: 0.2, marginBottom: '1rem', margin: '0 auto' }} />
                                <p>No history found.</p>
                            </div>
                        ) : (
                            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '550px' }}>
                                {history.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedHistoryItem(item.id)}
                                        style={{
                                            padding: '1.25rem 1.5rem',
                                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            borderLeft: '2px solid var(--accent-primary)'
                                        }}
                                        className="history-item-hover"
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ 
                                                    fontSize: '0.9rem', 
                                                    fontWeight: '600', 
                                                    marginBottom: '0.4rem', 
                                                    color: 'var(--text-primary)',
                                                    wordBreak: 'break-all',
                                                    lineHeight: '1.4'
                                                }}>
                                                    {item.url?.replace('https://', '').replace('http://', '') || item.title}
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: '500' }}>
                                                        {new Date(item.created_at).toLocaleDateString()}
                                                    </span>
                                                    <div style={{
                                                        fontSize: '0.7rem',
                                                        fontWeight: '700',
                                                        padding: '0.15rem 0.5rem',
                                                        borderRadius: '4px',
                                                        background: item.score > 80 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                        color: item.score > 80 ? 'var(--success)' : 'var(--warning)',
                                                    }}>
                                                        {item.score?.toFixed(0)}%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Results Area - Full Width Below Inputs/History */}
            <div style={{ marginTop: '1.5rem' }}>
                {analysisResults ? (
                    <ResultsPanel results={analysisResults} onReset={() => updateVisibility({ analysisResults: null })} />
                ) : (
                    <div className="glass-card" style={{ 
                        minHeight: '400px', 
                        background: 'rgba(15, 23, 42, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1.5rem',
                        borderStyle: 'dashed',
                        borderWidth: '2px'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'rgba(59, 130, 246, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-primary)'
                        }}>
                            <Target size={32} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Ready for Analysis</h3>
                            <p style={{ color: 'var(--text-secondary)', maxWidth: '280px', fontSize: '0.9rem' }}>
                                Enter a URL above to audit its visibility across AI search engines.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Analysis Modal */}
            {selectedHistoryItem && (
                <AnalysisModal
                    itemId={selectedHistoryItem}
                    onClose={() => setSelectedHistoryItem(null)}
                />
            )}
        </div>
    )
}

export default VisibilityAnalysis
