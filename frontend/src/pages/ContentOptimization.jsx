import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PenTool, Lightbulb, Zap, Sparkles, Download, Copy, Check, Folder, Plus, X, Code2, Info as InfoIcon, History, Link as LinkIcon, TrendingUp, Target, RefreshCw } from 'lucide-react'
import axios from 'axios'
import ResultsPanel from '../components/ResultsPanel'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import html2canvas from 'html2canvas'
import { useAnalysisState } from '../context/AnalysisContext'

const TableWithCopy = ({ children }) => {
    const tableRef = useRef(null)
    const [copied, setCopied] = useState(false)

    const handleCopyTable = async () => {
        if (!tableRef.current) return
        try {
            const canvas = await html2canvas(tableRef.current, {
                backgroundColor: '#1e293b', // Dark background for table
                scale: 2, // High resolution
                logging: false,
                useCORS: true
            })

            canvas.toBlob(async (blob) => {
                const item = new ClipboardItem({ 'image/png': blob })
                await navigator.clipboard.write([item])
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            })
        } catch (err) {
            console.error('Table copy failed:', err)
        }
    }

    return (
        <div style={{ position: 'relative', margin: '2rem 0' }} className="group">
            <div style={{
                position: 'absolute',
                top: '-2.5rem',
                right: '0',
                opacity: 1, // Always visible for usability, or change to 0 and use group-hover
                transition: 'opacity 0.2s'
            }}>
                    <button
                        onClick={handleCopyTable}
                        className="btn btn-outline"
                        style={{
                            padding: '0.25rem 0.75rem',
                            fontSize: '0.75rem',
                            background: '#0a0a0f',
                            border: '1px solid var(--card-border)',
                            gap: '0.25rem',
                            color: copied ? 'var(--success)' : 'var(--text-secondary)'
                        }}
                        title="Copy this table as an image (for Medium/LinkedIn)"
                    >
                    {copied ? <Check size={14} /> : <Download size={14} />}
                    {copied ? 'Copied!' : 'Copy Table Image'}
                </button>
            </div>
            <div ref={tableRef} style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                <table>
                    {children}
                </table>
            </div>
        </div>
    )
}

// Shared input style for schema forms
const inputStyle = {
    width: '100%',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--card-border)',
    color: 'var(--text-primary)',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    outline: 'none',
    fontSize: '0.875rem'
}

// Reusable input component for schema fields
function SchemaInput({ label, value, onChange, placeholder, type = 'text' }) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={inputStyle}
            />
        </div>
    )
}

function ContentOptimization() {
    const [searchParams] = useSearchParams()
    const projectFromUrl = searchParams.get('project')
    const contentRef = useRef(null)

    // Use context for persistent state
    const { optimizationState, updateOptimization } = useAnalysisState()
    const { content, activeTab, contentType, analysisResults, optimizedContent } = optimizationState

    // Local-only state
    const [selectedProject, setSelectedProject] = useState(projectFromUrl || '')
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [history, setHistory] = useState([])
    const [loadingHistory, setLoadingHistory] = useState(false)

    // Create project inline
    const [showCreateProject, setShowCreateProject] = useState(false)
    const [newProjectName, setNewProjectName] = useState('')
    const [creatingProject, setCreatingProject] = useState(false)

    useEffect(() => {
        fetchHistory()
        fetchProjects()

        // If we arrived with a pre-populated prompt (from Strategy), 
        // focus the editor or show a hint
        if (content && activeTab === 'generate' && !analysisResults) {
            contentRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [])

    const fetchHistory = async () => {
        try {
            const response = await axios.get('/api/history?type=text&limit=5')
            setHistory(response.data.items)
        } catch (error) {
            console.error('Failed to fetch history:', error)
        }
    }

    const handleHistoryItemClick = async (itemId) => {
        setLoadingHistory(true)
        setError(null)
        try {
            const response = await axios.get(`/api/analysis/${itemId}`)
            const data = response.data
            
            // Update context state
            updateOptimization({
                content: data.content,
                analysisResults: data.analysis,
                optimizedContent: null // Reset optimization on history load
            })
            
            // Set view mode to analysis
            setViewMode('analysis')
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch (err) {
            console.error('Failed to load history item:', err)
            setError('Failed to load historical data')
        } finally {
            setLoadingHistory(false)
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
                description: 'Created from Content Optimizer'
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

    // viewMode is local state
    const [viewMode, setViewMode] = useState('analysis') // 'analysis' or 'result'

    // Schema Generator State
    const [schemaResult, setSchemaResult] = useState(null)
    const [schemaLoading, setSchemaLoading] = useState(false)
    const [schemaCopied, setSchemaCopied] = useState(false)
    const [schemaType, setSchemaType] = useState('article') // article, product, faq, howto
    const [schemaMetadata, setSchemaMetadata] = useState({
        // Article fields
        title: '',
        author: '',
        datePublished: '',
        description: '',
        url: '',
        // Product fields
        productName: '',
        price: '',
        currency: 'USD',
        brand: '',
        availability: 'InStock',
        imageUrl: '',
        // FAQ fields
        faqItems: [{ question: '', answer: '' }],
        // HowTo fields
        howtoSteps: [{ name: '', text: '' }]
    })

    // Keyword Extraction State
    const [keywords, setKeywords] = useState(null)
    const [keywordsLoading, setKeywordsLoading] = useState(false)
    const [selectedKeyword, setSelectedKeyword] = useState('')
    const [customKeyword, setCustomKeyword] = useState('')

    // Smart Injection State - RESTORED PHASE 2
    const [semanticGaps, setSemanticGaps] = useState([])
    const [generatingInjection, setGeneratingInjection] = useState(false)
    const [manualInjectionTarget, setManualInjectionTarget] = useState('')

    // Import URL State
    const [showUrlImport, setShowUrlImport] = useState(false)
    const [importUrl, setImportUrl] = useState('')
    const [importLoading, setImportLoading] = useState(false)

    const handleImportUrl = async () => {
        if (!importUrl.trim()) return
        setImportLoading(true)
        try {
            const response = await axios.post('/api/extract-content', { url: importUrl })
            if (response.data.success) {
                updateOptimization({ content: response.data.content })
                setShowUrlImport(false)
                setImportUrl('')
                // Auto switch to ecommerce if not already
                if (contentType !== 'ecommerce') {
                    // Optional: could auto-detect but let's just hint
                }
            }
        } catch (err) {
            alert('Failed to import content: ' + (err.response?.data?.detail || err.message))
        } finally {
            setImportLoading(false)
        }
    }

    const handleExtractKeywords = async () => {
        if (!content.trim() || content.length < 100) return
        setKeywordsLoading(true)
        try {
            const response = await axios.post('/api/extract-keywords', {
                content: content,
                content_type: contentType
            })
            setKeywords(response.data)
            if (response.data.primary_keyword) {
                setSelectedKeyword(response.data.primary_keyword)
            }
        } catch (err) {
            console.error('Keyword extraction failed:', err)
        } finally {
            setKeywordsLoading(false)
        }
    }

    // Auto-extract keywords when content changes (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (content.length > 200 && !keywords && activeTab !== 'schema') {
                handleExtractKeywords()
            }
        }, 1500) // 1.5 second debounce
        return () => clearTimeout(timer)
    }, [content])

    const handleGenerateInjection = async (target = null) => {
        const targetToUse = target || manualInjectionTarget;
        if (!targetToUse) return;
        
        setGeneratingInjection(true);
        try {
            const response = await axios.post('/api/optimize/inject', {
                context_text: content,
                injection_target: targetToUse,
                tone: 'professional'
            });
            
            if (response.data.injection) {
                const newContent = content + "\n\n" + response.data.injection;
                updateOptimization({ content: newContent });
                setManualInjectionTarget('');
            }
        } catch (err) {
            alert("Failed to generate targeted injection.");
        } finally {
            setGeneratingInjection(false);
        }
    };

    const handleGenerateSchema = async () => {
        if (!content.trim()) return
        
        setSchemaLoading(true)
        setSchemaResult(null)
        setError(null)

        // Build content string from metadata based on schema type
        let contentForSchema = ''
        let metadata = {}

        if (schemaType === 'article') {
            contentForSchema = schemaMetadata.description || schemaMetadata.title
            metadata = {
                title: schemaMetadata.title,
                author: schemaMetadata.author,
                datePublished: schemaMetadata.datePublished,
                url: schemaMetadata.url,
                description: schemaMetadata.description
            }
        } else if (schemaType === 'product') {
            contentForSchema = schemaMetadata.description || schemaMetadata.productName
            metadata = {
                name: schemaMetadata.productName,
                price: schemaMetadata.price,
                currency: schemaMetadata.currency,
                brand: schemaMetadata.brand,
                availability: schemaMetadata.availability,
                image: schemaMetadata.imageUrl,
                description: schemaMetadata.description
            }
        } else if (schemaType === 'faq') {
            // Build FAQ content from Q&A pairs
            contentForSchema = schemaMetadata.faqItems
                .filter(item => item.question && item.answer)
                .map(item => `Q: ${item.question}\nA: ${item.answer}`)
                .join('\n\n')
            metadata = { faqItems: schemaMetadata.faqItems.filter(item => item.question && item.answer) }
        } else if (schemaType === 'howto') {
            contentForSchema = schemaMetadata.description || schemaMetadata.title
            metadata = {
                title: schemaMetadata.title,
                description: schemaMetadata.description,
                steps: schemaMetadata.howtoSteps.filter(step => step.name || step.text)
            }
        }

        try {
            const response = await axios.post('/api/generate-schema', {
                content: contentForSchema || 'placeholder', // minimal content required by backend
                content_type: schemaType,
                metadata: metadata
            })
            setSchemaResult(response.data)
        } catch (err) {
            setError(err.response?.data?.detail || 'Schema generation failed')
        } finally {
            setSchemaLoading(false)
        }
    }

    const copySchemaToClipboard = () => {
        if (schemaResult?.html_snippet) {
            navigator.clipboard.writeText(schemaResult.html_snippet)
            setSchemaCopied(true)
            setTimeout(() => setSchemaCopied(false), 2000)
        }
    }

    const handleOptimize = async () => {
        if (!content.trim()) return

        setLoading(true)
        setError(null)
        updateOptimization({ analysisResults: null, optimizedContent: '' })

        try {
            // Parallel execution: Get Scores AND Get Optimized Version
            const [analysisRes, optimizationRes] = await Promise.all([
                axios.post('/api/analyze-text', {
                    content: content,
                    title: activeTab === 'rewrite' ? "Original Draft" : "Topic Idea",
                    content_type: contentType,
                    target_keyword: selectedKeyword || customKeyword || undefined
                }),
                axios.post('/api/optimize-content', {
                    content: content,
                    mode: activeTab, // 'rewrite' or 'generate'
                    content_type: contentType,
                    target_keyword: selectedKeyword || customKeyword || undefined
                })
            ])

            updateOptimization({
                analysisResults: analysisRes.data,
                optimizedContent: optimizationRes.data.optimized_content
            })

            // Auto switch to result view if generating
            if (activeTab === 'generate') setViewMode('result')

            fetchHistory()
        } catch (err) {
            console.error(err)
            setError(err.message || 'Optimization failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '0', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Sparkles size={24} color="var(--accent-primary)" />
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                            GEO Perception Layer
                        </span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.04em' }}>
                        Content Optimization
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        Rewrite and generate high-ranking, AI-native content
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <button
                    onClick={() => updateOptimization({ activeTab: 'rewrite' })}
                    className={`btn ${activeTab === 'rewrite' ? 'btn-primary' : 'btn-outline'}`}
                    style={{
                        gap: '0.6rem',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '100px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        boxShadow: activeTab === 'rewrite' ? '0 8px 20px rgba(59, 130, 246, 0.3)' : 'none'
                    }}
                >
                    <PenTool size={18} /> Rewrite Content
                </button>
                <button
                    onClick={() => updateOptimization({ activeTab: 'generate' })}
                    className={`btn ${activeTab === 'generate' ? 'btn-primary' : 'btn-outline'}`}
                    style={{
                        gap: '0.6rem',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '100px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        boxShadow: activeTab === 'generate' ? '0 8px 20px rgba(59, 130, 246, 0.3)' : 'none'
                    }}
                >
                    <Lightbulb size={18} /> Generate from Idea
                </button>
                <button
                    onClick={() => updateOptimization({ activeTab: 'schema' })}
                    className={`btn ${activeTab === 'schema' ? 'btn-primary' : 'btn-outline'}`}
                    style={{
                        gap: '0.6rem',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '100px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        boxShadow: activeTab === 'schema' ? '0 8px 20px rgba(59, 130, 246, 0.3)' : 'none'
                    }}
                >
                    <Code2 size={18} /> Generate Schema
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                {/* Left Column - Input */}
                <div>
                    <div className="depth-card" style={{ padding: '1.5rem' }}>
                        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontSize: '1.1rem', fontWeight: '700', letterSpacing: '-0.02em' }}>
                                    {activeTab === 'generate' ? 'Topic Idea' : 'Source Content'}
                                </span>
                                <button
                                    onClick={() => setShowUrlImport(!showUrlImport)}
                                    className="btn btn-outline"
                                    style={{
                                        padding: '0.35rem 0.75rem',
                                        fontSize: '0.75rem',
                                        gap: '0.4rem',
                                        height: 'auto',
                                        borderRadius: '6px',
                                        borderColor: 'var(--card-border)',
                                        display: activeTab === 'schema' ? 'none' : 'flex'
                                    }}
                                    title="Import from URL"
                                >
                                    <LinkIcon size={14} /> Import URL
                                </button>
                            </div>
                            <select
                                value={contentType}
                                onChange={(e) => updateOptimization({ contentType: e.target.value })}
                                style={{
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--card-border)',
                                    color: 'var(--text-primary)',
                                    padding: '0.4rem 2.5rem 0.4rem 1rem',
                                    borderRadius: '8px',
                                    outline: 'none',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    appearance: 'none',
                                    WebkitAppearance: 'none',
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 0.75rem center',
                                    backgroundSize: '1rem'
                                }}
                            >
                                <option value="general">General / Blog</option>
                                <option value="ecommerce">E-commerce</option>
                                <option value="educational">Educational</option>
                            </select>
                        </div>

                        {showUrlImport && (
                            <div className="glass-card animate-fade-in" style={{
                                padding: '1rem',
                                marginBottom: '1.5rem',
                                background: '#111827',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '12px'
                            }}>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <input
                                        type="url"
                                        placeholder="https://example.com/product"
                                        value={importUrl}
                                        onChange={(e) => setImportUrl(e.target.value)}
                                        style={{
                                            flex: 1,
                                            background: 'var(--bg-tertiary)',
                                            border: '1px solid var(--card-border)',
                                            color: 'white',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem',
                                            outline: 'none'
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleImportUrl()}
                                    />
                                    <button
                                        onClick={handleImportUrl}
                                        disabled={importLoading || !importUrl.trim()}
                                        className="btn btn-primary"
                                        style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
                                    >
                                        {importLoading ? 'Fetching...' : 'Import'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div style={{ position: 'relative', marginBottom: '1.5rem', display: activeTab === 'schema' ? 'none' : 'block' }}>
                            <textarea
                                ref={contentRef}
                                value={content}
                                onChange={(e) => updateOptimization({ content: e.target.value })}
                                placeholder={activeTab === 'generate'
                                    ? "Enter your topic, key points, or content idea here. We will generate a comprehensive, high-ranking article..."
                                    : "Paste your existing draft here. We will restructure it, enhance E-E-A-T signals, and optimize for query intent..."
                                }
                                style={{
                                    width: '100%',
                                    minHeight: '440px',
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--card-border)',
                                    borderRadius: '12px',
                                    padding: '1.25rem',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.6',
                                    resize: 'vertical',
                                    outline: 'none',
                                    boxShadow: (content && activeTab === 'generate' && !analysisResults) ? '0 0 0 2px var(--accent-primary)' : 'none',
                                    transition: 'all 0.3s ease',
                                    display: activeTab === 'schema' ? 'none' : 'block'
                                }}
                            />
                            {content && activeTab === 'generate' && !analysisResults && (
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    background: 'var(--accent-primary)',
                                    color: 'white',
                                    padding: '1rem 1.5rem',
                                    borderRadius: '100px',
                                    fontSize: '0.9rem',
                                    fontWeight: '700',
                                    pointerEvents: 'none',
                                    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)',
                                    zIndex: 10,
                                    width: 'max-content',
                                    animation: 'pulse 2s infinite'
                                }} className="hide-mobile">
                                    ✨ Prompt Loaded! Ready to Generate?
                                </div>
                            )}
                            <div style={{
                                position: 'absolute',
                                bottom: '1.25rem',
                                right: '1.25rem',
                                fontSize: '0.75rem',
                                color: 'var(--text-tertiary)',
                                fontWeight: '600',
                                background: 'var(--bg-tertiary)',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '6px',
                                pointerEvents: 'none',
                                border: '1px solid var(--card-border)'
                            }}>
                                {content.length.toLocaleString()} characters
                            </div>
                        </div>

                        {activeTab !== 'schema' && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.875rem',
                                color: 'var(--text-secondary)',
                                marginBottom: '1rem'
                            }}>
                                <InfoIcon size={14} /> Paste the full text you want to improve. Markdown is supported.
                            </div>
                        )}

                        {/* Project Selector - Hide for schema */}
                        {activeTab !== 'schema' && (
                            <div style={{ marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <Folder size={16} color="var(--accent-primary)" />
                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Assign to Project (Optional)</span>
                                </div>

                                {showCreateProject ? (
                                    <div style={{ display: 'flex', gap: '0.75rem' }} className="animate-fade-in">
                                        <input
                                            type="text"
                                            value={newProjectName}
                                            onChange={(e) => setNewProjectName(e.target.value)}
                                            placeholder="Enter project name..."
                                            autoFocus
                                            style={{
                                                flex: 1,
                                                background: 'var(--bg-tertiary)',
                                                border: '1px solid var(--card-border)',
                                                color: 'var(--text-primary)',
                                                padding: '0.6rem 1rem',
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
                                            style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
                                        >
                                            {creatingProject ? '...' : 'Create'}
                                        </button>
                                        <button
                                            onClick={() => { setShowCreateProject(false); setNewProjectName(''); }}
                                            className="btn btn-outline"
                                            style={{ padding: '0.6rem', fontSize: '0.85rem', borderRadius: '8px' }}
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <select
                                            value={selectedProject}
                                            onChange={(e) => setSelectedProject(e.target.value)}
                                            style={{
                                                flex: 1,
                                                background: 'var(--bg-tertiary)',
                                                border: '1px solid var(--card-border)',
                                                color: 'var(--text-primary)',
                                                padding: '0.6rem 2.5rem 0.6rem 1rem',
                                                borderRadius: '8px',
                                                outline: 'none',
                                                fontSize: '0.9rem',
                                                cursor: 'pointer',
                                                appearance: 'none',
                                                WebkitAppearance: 'none',
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 0.75rem center',
                                                backgroundSize: '1rem'
                                            }}
                                        >
                                            <option value="">No project (standalone)</option>
                                            {projects.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => setShowCreateProject(true)}
                                            className="btn btn-outline"
                                            style={{
                                                padding: '0.6rem 1rem',
                                                fontSize: '0.85rem',
                                                borderRadius: '8px',
                                                borderColor: 'rgba(255,255,255,0.15)'
                                            }}
                                            title="Create new project"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Keyword Suggestions Panel - Show only for rewrite/generate modes */}
                        {activeTab !== 'schema' && content.length > 100 && (
                            <div style={{
                                marginBottom: '1.5rem',
                                padding: '1.25rem',
                                background: '#111827',
                                borderRadius: '12px',
                                border: '1px solid rgba(59, 130, 246, 0.3)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                    <Sparkles size={18} color="var(--accent-primary)" />
                                    <span style={{ fontSize: '1rem', fontWeight: '700', letterSpacing: '-0.01em' }}>Target Keywords</span>
                                    {keywordsLoading && (
                                        <div className="shimmer" style={{ width: '80px', height: '14px', borderRadius: '4px', marginLeft: 'auto' }}></div>
                                    )}
                                </div>

                                {keywords && (
                                    <>
                                        {/* Primary Keyword */}
                                        <div style={{ marginBottom: '1.25rem' }}>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '0.5rem' }}>
                                                PRIMARY TARGET
                                            </span>
                                            <button
                                                onClick={() => setSelectedKeyword(keywords.primary_keyword)}
                                                style={{
                                                    padding: '0.6rem 1.25rem',
                                                    background: selectedKeyword === keywords.primary_keyword ? 'linear-gradient(135deg, var(--accent-primary) 0%, #2563eb 100%)' : 'var(--bg-tertiary)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '100px',
                                                    color: 'white',
                                                    fontSize: '0.9rem',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    boxShadow: selectedKeyword === keywords.primary_keyword ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {keywords.primary_keyword}
                                            </button>
                                        </div>

                                        {/* Secondary Keywords */}
                                        {keywords.secondary_keywords?.length > 0 && (
                                            <div style={{ marginBottom: '1.25rem' }}>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '0.5rem' }}>
                                                    SECONDARY KEYWORDS
                                                </span>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                                                    {keywords.secondary_keywords.map((kw, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => setSelectedKeyword(kw)}
                                                            style={{
                                                                padding: '0.4rem 1rem',
                                                                background: selectedKeyword === kw ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                                                border: '1px solid rgba(255,255,255,0.08)',
                                                                borderRadius: '100px',
                                                                color: selectedKeyword === kw ? 'white' : 'var(--text-secondary)',
                                                                fontSize: '0.8rem',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            {kw}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Custom Keyword Input */}
                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                                    <input
                                        type="text"
                                        value={customKeyword}
                                        onChange={(e) => setCustomKeyword(e.target.value)}
                                        placeholder="Add custom keyword..."
                                        style={{
                                            flex: 1,
                                            background: 'var(--bg-tertiary)',
                                            border: '1px solid var(--card-border)',
                                            color: 'var(--text-primary)',
                                            padding: '0.6rem 1rem',
                                            borderRadius: '8px',
                                            outline: 'none',
                                            fontSize: '0.85rem'
                                        }}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && customKeyword.trim()) setSelectedKeyword(customKeyword) }}
                                    />
                                    <button
                                        onClick={() => { if (customKeyword.trim()) setSelectedKeyword(customKeyword) }}
                                        className="btn btn-outline"
                                        style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                                        disabled={!customKeyword.trim()}
                                    >
                                        Use
                                    </button>
                                </div>

                                {selectedKeyword && (
                                    <div style={{
                                        marginTop: '1.25rem',
                                        padding: '0.75rem 1rem',
                                        background: '#0a1d15',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                        fontSize: '0.85rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <Check size={16} color="var(--success)" />
                                        <span>Targeting: <strong style={{ color: 'var(--success)' }}>{selectedKeyword}</strong></span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Smart Injection Panel - RESTORED PHASE 2 */}
                        {activeTab !== 'schema' && (
                            <div style={{
                                marginBottom: '1.5rem',
                                padding: '1.5rem',
                                background: 'linear-gradient(135deg, #0f172a 0%, #172554 100%)',
                                borderRadius: '12px',
                                border: '1px solid rgba(59, 130, 246, 0.4)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'var(--accent-gradient)' }} />
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                    <Zap size={20} color="var(--accent-primary)" fill="currentColor" />
                                    <span style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'white' }}>
                                        Smart Injection Auto-Writer
                                    </span>
                                    <div style={{ marginLeft: 'auto', padding: '0.2rem 0.6rem', borderRadius: '100px', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>
                                        AI-Powered
                                    </div>
                                </div>
                                
                                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                                    Detected a semantic gap? Tell the AI what's missing and it will generate a tone-matched block to inject into your protagonists.
                                </p>
                                
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <input
                                        type="text"
                                        value={manualInjectionTarget}
                                        onChange={(e) => setManualInjectionTarget(e.target.value)}
                                        placeholder="e.g. 'Add a technical specifications comparison table' or 'Explain the E-E-A-T background'"
                                        style={{
                                            flex: 1,
                                            background: 'rgba(0,0,0,0.4)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'white',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '8px',
                                            outline: 'none',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                    <button
                                        onClick={() => handleGenerateInjection()}
                                        disabled={generatingInjection || !manualInjectionTarget.trim()}
                                        style={{
                                            padding: '0 1.5rem',
                                            background: 'var(--accent-gradient)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            opacity: (generatingInjection || !manualInjectionTarget.trim()) ? 0.6 : 1,
                                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
                                        }}
                                    >
                                        {generatingInjection ? <RefreshCw size={18} className="spin" /> : <PenTool size={18} />}
                                        Inject
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'schema' ? (
                            <>
                                {/* Schema Type Selection */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        SCHEMA TYPE
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
                                        {['article', 'product', 'faq', 'howto'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setSchemaType(type)}
                                                className={`btn ${schemaType === type ? 'btn-primary' : 'btn-outline'}`}
                                                style={{
                                                    padding: '0.6rem',
                                                    fontSize: '0.85rem',
                                                    textTransform: 'capitalize',
                                                    borderRadius: '8px',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                {type === 'faq' ? 'FAQ' : type === 'howto' ? 'How-To' : type.charAt(0).toUpperCase() + type.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Dynamic Fields Based on Schema Type */}
                                <div style={{ marginBottom: '2rem' }}>
                                    {schemaType === 'article' && (
                                        <div style={{ display: 'grid', gap: '1.25rem' }}>
                                            <SchemaInput label="Article Headline *" value={schemaMetadata.title} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, title: v })} placeholder="The ultimate guide to..." />
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <SchemaInput label="Author Name" value={schemaMetadata.author} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, author: v })} placeholder="Jane Doe" />
                                                <SchemaInput label="Date Published" value={schemaMetadata.datePublished} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, datePublished: v })} placeholder="YYYY-MM-DD" type="date" />
                                            </div>
                                            <SchemaInput label="Description" value={schemaMetadata.description} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, description: v })} placeholder="Brief summary for search engines" />
                                            <SchemaInput label="Canonical URL" value={schemaMetadata.url} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, url: v })} placeholder="https://yourdomain.com/article" />
                                        </div>
                                    )}

                                    {schemaType === 'product' && (
                                        <div style={{ display: 'grid', gap: '1.25rem' }}>
                                            <SchemaInput label="Product Name *" value={schemaMetadata.productName} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, productName: v })} placeholder="iPhone 15 Pro Max" />
                                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                                <SchemaInput label="Price *" value={schemaMetadata.price} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, price: v })} placeholder="999.00" type="number" />
                                                <SchemaInput label="Currency" value={schemaMetadata.currency} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, currency: v })} placeholder="USD" />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <SchemaInput label="Brand" value={schemaMetadata.brand} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, brand: v })} placeholder="Apple" />
                                                <SchemaInput label="Availability" value={schemaMetadata.availability} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, availability: v })} placeholder="InStock" />
                                            </div>
                                            <SchemaInput label="Image URL" value={schemaMetadata.imageUrl} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, imageUrl: v })} placeholder="https://..." />
                                            <SchemaInput label="Product Description" value={schemaMetadata.description} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, description: v })} placeholder="Highlights and key features" />
                                        </div>
                                    )}

                                    {schemaType === 'faq' && (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '1rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                FAQ ITEMS
                                            </label>
                                            <div style={{ display: 'grid', gap: '1.25rem' }}>
                                                {schemaMetadata.faqItems.map((item, idx) => (
                                                    <div key={idx} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginBottom: '1rem', fontWeight: '800' }}>QUESTION #{idx + 1}</div>
                                                        <input
                                                            value={item.question}
                                                            onChange={(e) => {
                                                                const items = [...schemaMetadata.faqItems]
                                                                items[idx].question = e.target.value
                                                                setSchemaMetadata({ ...schemaMetadata, faqItems: items })
                                                            }}
                                                            placeholder="What is the return policy?"
                                                            style={{ ...inputStyle, marginBottom: '1rem' }}
                                                        />
                                                        <textarea
                                                            value={item.answer}
                                                            onChange={(e) => {
                                                                const items = [...schemaMetadata.faqItems]
                                                                items[idx].answer = e.target.value
                                                                setSchemaMetadata({ ...schemaMetadata, faqItems: items })
                                                            }}
                                                            placeholder="Our return policy is 30 days..."
                                                            rows={2}
                                                            style={{ ...inputStyle, resize: 'vertical' }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => setSchemaMetadata({ ...schemaMetadata, faqItems: [...schemaMetadata.faqItems, { question: '', answer: '' }] })}
                                                className="btn btn-outline"
                                                style={{ width: '100%', padding: '0.75rem', fontSize: '0.85rem', borderRadius: '8px', marginTop: '1.25rem' }}
                                            >
                                                + Add Another Question
                                            </button>
                                        </div>
                                    )}

                                    {schemaType === 'howto' && (
                                        <div style={{ display: 'grid', gap: '1.25rem' }}>
                                            <SchemaInput label="Guide Title *" value={schemaMetadata.title} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, title: v })} placeholder="How to setup your GEO engine" />
                                            <SchemaInput label="Summary Description" value={schemaMetadata.description} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, description: v })} placeholder="Step-by-step instructions for..." />

                                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                INSTRUCTION STEPS
                                            </label>
                                            <div style={{ display: 'grid', gap: '1rem' }}>
                                                {schemaMetadata.howtoSteps.map((step, idx) => (
                                                    <div key={idx} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginBottom: '0.75rem', fontWeight: '800' }}>STEP {idx + 1}</div>
                                                        <input
                                                            value={step.name}
                                                            onChange={(e) => {
                                                                const steps = [...schemaMetadata.howtoSteps]
                                                                steps[idx].name = e.target.value
                                                                setSchemaMetadata({ ...schemaMetadata, howtoSteps: steps })
                                                            }}
                                                            placeholder="Step title"
                                                            style={{ ...inputStyle, marginBottom: '0.75rem' }}
                                                        />
                                                        <textarea
                                                            value={step.text}
                                                            onChange={(e) => {
                                                                const steps = [...schemaMetadata.howtoSteps]
                                                                steps[idx].text = e.target.value
                                                                setSchemaMetadata({ ...schemaMetadata, howtoSteps: steps })
                                                            }}
                                                            placeholder="Instruction details"
                                                            rows={2}
                                                            style={{ ...inputStyle, resize: 'vertical' }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => setSchemaMetadata({ ...schemaMetadata, howtoSteps: [...schemaMetadata.howtoSteps, { name: '', text: '' }] })}
                                                className="btn btn-outline"
                                                style={{ width: '100%', padding: '0.75rem', fontSize: '0.85rem', borderRadius: '8px' }}
                                            >
                                                + Add Instruction Step
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleGenerateSchema}
                                    disabled={schemaLoading}
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '1rem' }}
                                >
                                    {schemaLoading ? 'Generating...' : <><Code2 size={18} /> Generate Schema</>}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleOptimize}
                                disabled={loading || !content.trim()}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '1rem' }}
                            >
                                {loading ? 'Processing...' : (
                                    activeTab === 'generate'
                                        ? <><Sparkles size={18} /> Generate Content</>
                                        : <><Zap size={18} /> Optimize Content</>
                                )}
                            </button>
                        )}

                        {error && (
                            <div style={{ marginTop: '1rem', color: 'var(--error)', fontSize: '0.9rem' }}>
                                Error: {error}
                            </div>
                        )}
                    </div>

                    {/* Results Area (conditionally rendered below input for now) */}
                    {/* Schema Result Display */}
                    {activeTab === 'schema' && schemaResult && (
                        <div className="depth-card animate-fade-in" style={{ marginTop: '3rem', padding: '2.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Generated Schema Object</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ padding: '0.2rem 0.6rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>
                                            {schemaResult.schema_type}
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Ready for deployment</span>
                                    </div>
                                </div>
                                <button
                                    onClick={copySchemaToClipboard}
                                    className="btn btn-primary"
                                    style={{ fontSize: '0.85rem', padding: '0.75rem 1.25rem', gap: '0.5rem' }}
                                >
                                    {schemaCopied ? <><Check size={18} /> Copied!</> : <><Copy size={18} /> Copy JSON-LD</>}
                                </button>
                            </div>
                            <pre style={{
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                overflow: 'auto',
                                maxHeight: '400px',
                                fontSize: '0.85rem',
                                color: '#a5f3fc',
                                fontFamily: 'JetBrains Mono, SF Mono, Menlo, monospace',
                                border: '1px solid rgba(255,255,255,0.05)',
                                lineHeight: '1.5'
                            }}>
                                {JSON.stringify(schemaResult.json_ld, null, 2)}
                            </pre>
                            <div style={{
                                marginTop: '1.5rem',
                                padding: '1.25rem',
                                background: 'rgba(16, 185, 129, 0.05)',
                                borderRadius: '12px',
                                border: '1px solid rgba(16, 185, 129, 0.15)',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.75rem'
                            }}>
                                <InfoIcon color="var(--success)" size={20} />
                                <p style={{ fontSize: '0.9rem', color: '#86efac', lineHeight: '1.5', margin: 0 }}>
                                    Your schema is valid and ready. Copy the code above and paste it anywhere within the <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>&lt;head&gt;</code> of your page.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Results Area */}
                    {activeTab !== 'schema' && (analysisResults || optimizedContent) && (
                        <div style={{ marginTop: '3rem' }} className="animate-fade-in">
                            {/* Result Tabs */}
                            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '2rem' }}>
                                <button
                                    onClick={() => setViewMode('analysis')}
                                    style={{
                                        padding: '1rem 2rem',
                                        background: 'none',
                                        border: 'none',
                                        borderBottom: viewMode === 'analysis' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                                        color: viewMode === 'analysis' ? 'white' : 'var(--text-tertiary)',
                                        fontWeight: '700',
                                        fontSize: '0.9rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    📊 Analysis
                                </button>
                                <button
                                    onClick={() => setViewMode('result')}
                                    style={{
                                        padding: '1rem 2rem',
                                        background: 'none',
                                        border: 'none',
                                        borderBottom: viewMode === 'result' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                                        color: viewMode === 'result' ? 'white' : 'var(--text-tertiary)',
                                        fontWeight: '700',
                                        fontSize: '0.9rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    ✨ Optimized
                                </button>
                                <button
                                    onClick={() => setViewMode('compare')}
                                    style={{
                                        padding: '1rem 2rem',
                                        background: 'none',
                                        border: 'none',
                                        borderBottom: viewMode === 'compare' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                                        color: viewMode === 'compare' ? 'white' : 'var(--text-tertiary)',
                                        fontWeight: '700',
                                        fontSize: '0.9rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    ⚖️ Compare
                                </button>
                            </div>

                            {viewMode === 'analysis' && analysisResults && (
                                <ResultsPanel results={analysisResults} onReset={() => updateOptimization({ analysisResults: null, optimizedContent: '' })} context="text" />
                            )}

                            {viewMode === 'result' && optimizedContent && (
                                <div className="depth-card animate-fade-in" style={{ padding: '2.5rem', background: 'rgba(15, 23, 42, 0.2)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '8px', height: '24px', background: 'var(--accent-primary)', borderRadius: '4px' }}></div>
                                            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                                                {activeTab === 'rewrite' ? 'Optimized Revision' : 'Generated Masterpiece'}
                                            </h3>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                            <button
                                                className="btn btn-primary"
                                                onClick={async () => {
                                                    try {
                                                        if (contentRef.current) {
                                                            const htmlBlob = new Blob([contentRef.current.innerHTML], { type: 'text/html' })
                                                            const textBlob = new Blob([optimizedContent], { type: 'text/plain' })
                                                            const item = new ClipboardItem({
                                                                'text/html': htmlBlob,
                                                                'text/plain': textBlob
                                                            })
                                                            await navigator.clipboard.write([item])
                                                        } else {
                                                            await navigator.clipboard.writeText(optimizedContent)
                                                        }
                                                    } catch (err) {
                                                        navigator.clipboard.writeText(optimizedContent)
                                                    }
                                                }}
                                                style={{ fontSize: '0.85rem', padding: '0.6rem 1.25rem', gap: '0.5rem', borderRadius: '100px' }}
                                            >
                                                <Copy size={16} /> Copy Content
                                            </button>
                                            <button
                                                className="btn btn-outline"
                                                onClick={() => {
                                                    const blob = new Blob([optimizedContent], { type: 'text/markdown' })
                                                    const url = URL.createObjectURL(blob)
                                                    const a = document.createElement('a')
                                                    a.href = url
                                                    a.download = `optimized-content-${Date.now()}.md`
                                                    a.click()
                                                    URL.revokeObjectURL(url)
                                                }}
                                                style={{ fontSize: '0.85rem', padding: '0.6rem 1.25rem', gap: '0.5rem', borderRadius: '100px' }}
                                            >
                                                <Download size={16} /> Markdown
                                            </button>
                                        </div>
                                    </div>
                                    <div className="markdown-content" ref={contentRef} style={{
                                        lineHeight: '1.8',
                                        color: '#cbd5e1',
                                        fontFamily: 'Inter, sans-serif',
                                        fontSize: '1.05rem'
                                    }}>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                table: TableWithCopy
                                            }}
                                        >
                                            {optimizedContent}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            {viewMode === 'compare' && optimizedContent && (
                                <div className="animate-fade-in">
                                    {/* Word Count Comparison */}
                                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                        <div className="depth-card" style={{
                                            flex: 1,
                                            padding: '1.5rem',
                                            background: 'rgba(239, 68, 68, 0.05)',
                                            textAlign: 'center',
                                            border: '1px solid rgba(239, 68, 68, 0.1)'
                                        }}>
                                            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ef4444' }}>{content.split(/\s+/).filter(Boolean).length}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Original Words</div>
                                        </div>
                                        <div className="depth-card" style={{
                                            flex: 1,
                                            padding: '1.5rem',
                                            background: 'rgba(16, 185, 129, 0.05)',
                                            textAlign: 'center',
                                            border: '1px solid rgba(16, 185, 129, 0.1)'
                                        }}>
                                            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>{optimizedContent.split(/\s+/).filter(Boolean).length}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Optimized Words</div>
                                        </div>
                                    </div>

                                    {/* Side by Side */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div className="depth-card" style={{ padding: '2rem', background: 'rgba(239, 68, 68, 0.02)', border: '1px solid rgba(239, 68, 68, 0.08)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                                <div style={{ width: '6px', height: '18px', background: '#ef4444', borderRadius: '4px' }}></div>
                                                <h4 style={{ fontSize: '0.9rem', fontWeight: '800', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>DRAFT VERSION</h4>
                                            </div>
                                            <div style={{
                                                whiteSpace: 'pre-wrap',
                                                fontSize: '0.95rem',
                                                lineHeight: '1.7',
                                                maxHeight: '500px',
                                                overflowY: 'auto',
                                                color: '#94a3b8'
                                            }}>
                                                {content}
                                            </div>
                                        </div>
                                        <div className="depth-card" style={{ padding: '2rem', background: 'rgba(16, 185, 129, 0.02)', border: '1px solid rgba(16, 185, 129, 0.08)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                                <div style={{ width: '6px', height: '18px', background: '#10b981', borderRadius: '4px' }}></div>
                                                <h4 style={{ fontSize: '0.9rem', fontWeight: '800', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>OPTIMIZED MASTER</h4>
                                            </div>
                                            <div className="markdown-content" style={{
                                                fontSize: '0.95rem',
                                                lineHeight: '1.7',
                                                maxHeight: '500px',
                                                overflowY: 'auto',
                                                color: '#f1f5f9'
                                            }}>
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {optimizedContent}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column - Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* History Panel */}
                    <div className="depth-card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{
                            padding: '1.25rem 1.5rem',
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(255,255,255,0.02)'
                        }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                {activeTab === 'schema' ? 'SCHEMA HISTORY' : activeTab === 'generate' ? 'GENERATION HISTORY' : 'OPTIMIZATION HISTORY'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '700' }}>
                                {history.length}
                            </span>
                        </div>
                        {history.length === 0 ? (
                            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                                <History size={24} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p>No history found.</p>
                            </div>
                        ) : (
                            <div style={{ maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
                                {history
                                    .filter(item => {
                                        const isSchema = item.title.toLowerCase().includes('schema') || item.title.toLowerCase().includes('json');
                                        if (activeTab === 'schema') return isSchema;
                                        return !isSchema;
                                    })
                                    .map(item => {
                                        const isSchema = item.title.toLowerCase().includes('schema') || item.title.toLowerCase().includes('json');
                                        return (
                                            <div key={item.id} 
                                                onClick={() => handleHistoryItemClick(item.id)}
                                                style={{
                                                    padding: '1.25rem 1.5rem',
                                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    borderLeft: `2px solid ${isSchema ? 'var(--accent-secondary)' : 'var(--accent-primary)'}`
                                                }} className="history-item">
                                                <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {item.title || 'Untitled Optimization'}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '0.6rem',
                                                        padding: '0.1rem 0.4rem',
                                                        borderRadius: '4px',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        color: 'var(--text-secondary)',
                                                        textTransform: 'uppercase',
                                                        fontWeight: '800'
                                                    }}>
                                                        {isSchema ? 'Schema' : (item.title.toLowerCase().includes('idea') ? 'Gen' : 'Rewrite')}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                                                    <span style={{ color: 'var(--text-tertiary)' }}>{new Date(item.created_at).toLocaleDateString()}</span>
                                                    {item.score != null && (
                                                        <div style={{
                                                            padding: '0.2rem 0.5rem',
                                                            borderRadius: '4px',
                                                            background: item.score > 80 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                            color: item.score > 80 ? 'var(--success)' : 'var(--warning)',
                                                            fontWeight: '700'
                                                        }}>
                                                            {Number(item.score).toFixed(0)}%
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                                {history.filter(item => {
                                    const isSchema = item.title.toLowerCase().includes('schema') || item.title.toLowerCase().includes('json');
                                    if (activeTab === 'schema') return isSchema;
                                    return !isSchema;
                                }).length === 0 && (
                                        <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                                            No {activeTab === 'schema' ? 'schema' : 'content'} history found in this project.
                                        </div>
                                    )}
                            </div>
                        )}
                    </div>

                    {/* Optimization Insights Panel */}
                    <div className="depth-card" style={{
                        padding: '1.5rem',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '16px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            {activeTab === 'schema' ? <Code2 size={18} color="var(--accent-primary)" /> : <TrendingUp size={18} color="var(--accent-primary)" />}
                            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>
                                {activeTab === 'schema' ? 'Schema Insights' : activeTab === 'generate' ? 'Generation Insights' : 'Optimization Insights'}
                            </h3>
                        </div>

                        {/* Recent Performance Stat */}
                        <div style={{
                            background: 'rgba(59, 130, 246, 0.05)',
                            padding: '1rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(59, 130, 246, 0.1)',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem', fontWeight: '700' }}>
                                {activeTab === 'schema' ? 'Estimated Accuracy' : 'Average Authority Score'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-primary)' }}>
                                    {activeTab === 'schema' ? '98%' : (history.length > 0 ? (history.reduce((acc, curr) => acc + (curr.score || 0), 0) / history.length).toFixed(0) + '%' : '0%')}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {activeTab === 'schema' ? 'Standardized Output' : `tracked across ${history.length} runs`}
                                </span>
                            </div>
                        </div>

                        {/* Quick Tips */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '-0.25rem' }}>Quick Tips</div>
                            {[
                                ...(activeTab === 'schema' ? [
                                    { icon: <Code2 size={14} />, text: "Use JSON-LD for more reliable RAG extraction." },
                                    { icon: <InfoIcon size={14} />, text: "Pair Articles with Author schema for E-E-A-T." },
                                    { icon: <Target size={14} />, text: "Ensure canonical URLs match sitemap data." }
                                ] : activeTab === 'generate' ? [
                                    { icon: <Target size={14} />, text: "Target high-intent query patterns (How, Why)." },
                                    { icon: <Sparkles size={14} />, text: "Include a direct answer in the first paragraph." },
                                    { icon: <Zap size={14} />, text: "Add a comparison table for data density." }
                                ] : [
                                    { icon: <Target size={14} />, text: "Use specific primary keywords in headings." },
                                    { icon: <Zap size={14} />, text: "Aim for 3-4 semantic keyword variations." },
                                    { icon: <InfoIcon size={14} />, text: "Add authoritative data to ground AI responses." }
                                ])
                            ].map((tip, i) => (
                                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                    <div style={{ marginTop: '0.2rem', color: 'var(--accent-primary)' }}>{tip.icon}</div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>{tip.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}


export default ContentOptimization
