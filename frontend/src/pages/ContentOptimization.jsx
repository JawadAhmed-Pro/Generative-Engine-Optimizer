import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PenTool, Lightbulb, Zap, Sparkles, Download, Copy, Check, Folder, Plus, X, Code2, Link as LinkIcon } from 'lucide-react'
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
                        background: 'rgba(0,0,0,0.6)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        gap: '0.25rem',
                        color: copied ? 'var(--success)' : 'var(--text-secondary)'
                    }}
                    title="Copy this table as an image (for Medium/LinkedIn)"
                >
                    {copied ? <Check size={14} /> : <Download size={14} />}
                    {copied ? 'Copied!' : 'Copy Table Image'}
                </button>
            </div>
            <div ref={tableRef} style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
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
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
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

    const handleGenerateSchema = async () => {
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
                    content_type: contentType
                }),
                axios.post('/api/optimize-content', {
                    content: content,
                    mode: activeTab, // 'rewrite' or 'generate'
                    content_type: contentType
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
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Content Optimization</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Rewrite and generate high-ranking content</p>
            </div>

            {/* Mode Toggles */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <button
                    onClick={() => updateOptimization({ activeTab: 'rewrite' })}
                    className={`btn ${activeTab === 'rewrite' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ gap: '0.5rem' }}
                >
                    <PenTool size={18} /> Rewrite Content
                </button>
                <button
                    onClick={() => updateOptimization({ activeTab: 'generate' })}
                    className={`btn ${activeTab === 'generate' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ gap: '0.5rem' }}
                >
                    <Lightbulb size={18} /> Generate from Idea
                </button>
                <button
                    onClick={() => updateOptimization({ activeTab: 'schema' })}
                    className={`btn ${activeTab === 'schema' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ gap: '0.5rem' }}
                >
                    <Code2 size={18} /> Generate Schema
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Left Column - Input */}
                <div>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ marginBottom: '1rem', fontWeight: '600', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>Source Content</span>
                                <button
                                    onClick={() => setShowUrlImport(!showUrlImport)}
                                    className="btn btn-outline"
                                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', gap: '0.25rem', height: 'auto' }}
                                    title="Import from URL"
                                >
                                    <LinkIcon size={12} /> Import URL
                                </button>
                            </div>
                            <select
                                value={contentType}
                                onChange={(e) => updateOptimization({ contentType: e.target.value })}
                                style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'var(--text-primary)',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '6px',
                                    outline: 'none',
                                    fontSize: '0.875rem'
                                }}
                            >
                                <option value="general">General / Blog</option>
                                <option value="ecommerce">E-commerce</option>
                                <option value="educational">Educational</option>
                            </select>
                        </div>

                        {showUrlImport && (
                            <div className="glass-card animate-fade-in" style={{ padding: '0.75rem', marginBottom: '1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="url"
                                        placeholder="https://example.com/product"
                                        value={importUrl}
                                        onChange={(e) => setImportUrl(e.target.value)}
                                        style={{
                                            flex: 1,
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'white',
                                            padding: '0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.85rem',
                                            outline: 'none'
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleImportUrl()}
                                    />
                                    <button
                                        onClick={handleImportUrl}
                                        disabled={importLoading || !importUrl.trim()}
                                        className="btn btn-primary"
                                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                    >
                                        {importLoading ? 'Fetching...' : 'Import'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div style={{ position: 'relative', marginBottom: '1rem' }}>
                                ref={contentRef}
                                value={content}
                                onChange={(e) => updateOptimization({ content: e.target.value })}
                                placeholder="Paste your existing draft here. We will restructure it, enhance E-E-A-T signals, and optimize for query intent..."
                                style={{
                                    width: '100%',
                                    minHeight: '400px',
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'Inter, sans-serif',
                                    resize: 'vertical',
                                    outline: 'none',
                                    boxShadow: (content && activeTab === 'generate' && !analysisResults) ? '0 0 0 2px var(--accent-primary)' : 'none',
                                    transition: 'box-shadow 0.3s ease'
                                }}
                            />
                            {content && activeTab === 'generate' && !analysisResults && (
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(100%, -50%)',
                                    background: 'var(--accent-primary)',
                                    color: 'white',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    pointerEvents: 'none',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                    zIndex: 10,
                                    width: 'max-content'
                                }} className="hide-mobile">
                                    ✨ Prompt Loaded! Ready to Generate?
                                </div>
                            )}
                            <div style={{
                                position: 'absolute',
                                bottom: '1rem',
                                right: '1rem',
                                fontSize: '0.75rem',
                                color: 'var(--text-tertiary)'
                            }}>
                                {content.length} chars
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '1rem'
                        }}>
                            <InfoIcon /> Paste the full text you want to improve. Markdown is supported.
                        </div>

                        {/* Project Selector */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Folder size={16} color="var(--text-secondary)" />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Assign to Project (optional)</span>
                            </div>

                            {showCreateProject ? (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        placeholder="New project name..."
                                        autoFocus
                                        style={{
                                            flex: 1,
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            color: 'var(--text-primary)',
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '6px',
                                            outline: 'none',
                                            fontSize: '0.875rem'
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                                    />
                                    <button
                                        onClick={handleCreateProject}
                                        disabled={creatingProject || !newProjectName.trim()}
                                        className="btn btn-primary"
                                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                    >
                                        {creatingProject ? '...' : 'Create'}
                                    </button>
                                    <button
                                        onClick={() => { setShowCreateProject(false); setNewProjectName(''); }}
                                        className="btn btn-outline"
                                        style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <select
                                        value={selectedProject}
                                        onChange={(e) => setSelectedProject(e.target.value)}
                                        style={{
                                            flex: 1,
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'var(--text-primary)',
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '6px',
                                            outline: 'none',
                                            fontSize: '0.875rem'
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
                                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                                        title="Create new project"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Keyword Suggestions Panel - Show only for rewrite/generate modes */}
                        {activeTab !== 'schema' && content.length > 100 && (
                            <div style={{
                                marginBottom: '1.5rem',
                                padding: '1rem',
                                background: 'rgba(59, 130, 246, 0.05)',
                                borderRadius: '8px',
                                border: '1px solid rgba(59, 130, 246, 0.2)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <Sparkles size={16} color="var(--accent-primary)" />
                                    <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Target Keywords</span>
                                    {keywordsLoading && (
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
                                            Analyzing...
                                        </span>
                                    )}
                                </div>

                                {keywords && (
                                    <>
                                        {/* Primary Keyword */}
                                        <div style={{ marginBottom: '0.75rem' }}>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>
                                                PRIMARY (click to select)
                                            </span>
                                            <button
                                                onClick={() => setSelectedKeyword(keywords.primary_keyword)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: selectedKeyword === keywords.primary_keyword ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                                                    border: 'none',
                                                    borderRadius: '20px',
                                                    color: 'white',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    fontWeight: selectedKeyword === keywords.primary_keyword ? '600' : '400'
                                                }}
                                            >
                                                {keywords.primary_keyword}
                                            </button>
                                        </div>

                                        {/* Secondary Keywords */}
                                        {keywords.secondary_keywords?.length > 0 && (
                                            <div style={{ marginBottom: '0.75rem' }}>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>
                                                    SECONDARY
                                                </span>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    {keywords.secondary_keywords.map((kw, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => setSelectedKeyword(kw)}
                                                            style={{
                                                                padding: '0.35rem 0.75rem',
                                                                background: selectedKeyword === kw ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                                                                border: '1px solid rgba(255,255,255,0.1)',
                                                                borderRadius: '15px',
                                                                color: selectedKeyword === kw ? 'white' : 'var(--text-secondary)',
                                                                fontSize: '0.75rem',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            {kw}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Long-tail Keywords */}
                                        {keywords.long_tail_keywords?.length > 0 && (
                                            <div style={{ marginBottom: '0.75rem' }}>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>
                                                    LONG-TAIL QUERIES
                                                </span>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                    {keywords.long_tail_keywords.map((kw, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => setSelectedKeyword(kw)}
                                                            style={{
                                                                padding: '0.35rem 0.75rem',
                                                                background: selectedKeyword === kw ? 'var(--accent-primary)' : 'transparent',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                color: selectedKeyword === kw ? 'white' : 'var(--text-secondary)',
                                                                fontSize: '0.75rem',
                                                                cursor: 'pointer',
                                                                textAlign: 'left'
                                                            }}
                                                        >
                                                            🔍 {kw}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Custom Keyword Input */}
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                    <input
                                        type="text"
                                        value={customKeyword}
                                        onChange={(e) => setCustomKeyword(e.target.value)}
                                        placeholder="Or enter your own keyword..."
                                        style={{
                                            flex: 1,
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'var(--text-primary)',
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '6px',
                                            outline: 'none',
                                            fontSize: '0.8rem'
                                        }}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && customKeyword.trim()) setSelectedKeyword(customKeyword) }}
                                    />
                                    <button
                                        onClick={() => { if (customKeyword.trim()) setSelectedKeyword(customKeyword) }}
                                        className="btn btn-outline"
                                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                                        disabled={!customKeyword.trim()}
                                    >
                                        Use
                                    </button>
                                </div>

                                {selectedKeyword && (
                                    <div style={{
                                        marginTop: '0.75rem',
                                        padding: '0.5rem 0.75rem',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem'
                                    }}>
                                        ✅ Optimization will target: <strong style={{ color: 'var(--success)' }}>{selectedKeyword}</strong>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'schema' ? (
                            <>
                                {/* Schema Type Selection */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '600' }}>
                                        SCHEMA TYPE
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                        {['article', 'product', 'faq', 'howto'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setSchemaType(type)}
                                                className={`btn ${schemaType === type ? 'btn-primary' : 'btn-outline'}`}
                                                style={{ padding: '0.5rem', fontSize: '0.8rem', textTransform: 'capitalize' }}
                                            >
                                                {type === 'faq' ? 'FAQ' : type === 'howto' ? 'How-To' : type.charAt(0).toUpperCase() + type.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Dynamic Fields Based on Schema Type */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    {schemaType === 'article' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <SchemaInput label="Title *" value={schemaMetadata.title} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, title: v })} placeholder="Article headline" />
                                            <SchemaInput label="Author" value={schemaMetadata.author} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, author: v })} placeholder="Author name" />
                                            <SchemaInput label="Date Published" value={schemaMetadata.datePublished} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, datePublished: v })} placeholder="YYYY-MM-DD" type="date" />
                                            <SchemaInput label="Description" value={schemaMetadata.description} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, description: v })} placeholder="Brief summary" />
                                            <SchemaInput label="URL" value={schemaMetadata.url} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, url: v })} placeholder="https://..." />
                                        </div>
                                    )}

                                    {schemaType === 'product' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <SchemaInput label="Product Name *" value={schemaMetadata.productName} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, productName: v })} placeholder="Product title" />
                                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                                                <SchemaInput label="Price *" value={schemaMetadata.price} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, price: v })} placeholder="99.99" type="number" />
                                                <SchemaInput label="Currency" value={schemaMetadata.currency} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, currency: v })} placeholder="USD" />
                                            </div>
                                            <SchemaInput label="Brand" value={schemaMetadata.brand} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, brand: v })} placeholder="Brand name" />
                                            <SchemaInput label="Image URL" value={schemaMetadata.imageUrl} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, imageUrl: v })} placeholder="https://...image.jpg" />
                                            <SchemaInput label="Description" value={schemaMetadata.description} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, description: v })} placeholder="Product description" />
                                        </div>
                                    )}

                                    {schemaType === 'faq' && (
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '600' }}>
                                                FAQ ITEMS
                                            </label>
                                            {schemaMetadata.faqItems.map((item, idx) => (
                                                <div key={idx} style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                                    <input
                                                        value={item.question}
                                                        onChange={(e) => {
                                                            const items = [...schemaMetadata.faqItems]
                                                            items[idx].question = e.target.value
                                                            setSchemaMetadata({ ...schemaMetadata, faqItems: items })
                                                        }}
                                                        placeholder={`Question ${idx + 1}`}
                                                        style={inputStyle}
                                                    />
                                                    <textarea
                                                        value={item.answer}
                                                        onChange={(e) => {
                                                            const items = [...schemaMetadata.faqItems]
                                                            items[idx].answer = e.target.value
                                                            setSchemaMetadata({ ...schemaMetadata, faqItems: items })
                                                        }}
                                                        placeholder="Answer"
                                                        rows={2}
                                                        style={{ ...inputStyle, marginTop: '0.5rem', resize: 'vertical' }}
                                                    />
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => setSchemaMetadata({ ...schemaMetadata, faqItems: [...schemaMetadata.faqItems, { question: '', answer: '' }] })}
                                                className="btn btn-outline"
                                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}
                                            >
                                                + Add Another Question
                                            </button>
                                        </div>
                                    )}

                                    {schemaType === 'howto' && (
                                        <div>
                                            <SchemaInput label="Guide Title *" value={schemaMetadata.title} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, title: v })} placeholder="How to..." />
                                            <SchemaInput label="Description" value={schemaMetadata.description} onChange={(v) => setSchemaMetadata({ ...schemaMetadata, description: v })} placeholder="Brief overview" />
                                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', marginTop: '1rem', fontWeight: '600' }}>
                                                STEPS
                                            </label>
                                            {schemaMetadata.howtoSteps.map((step, idx) => (
                                                <div key={idx} style={{ marginBottom: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>Step {idx + 1}</div>
                                                    <input
                                                        value={step.name}
                                                        onChange={(e) => {
                                                            const steps = [...schemaMetadata.howtoSteps]
                                                            steps[idx].name = e.target.value
                                                            setSchemaMetadata({ ...schemaMetadata, howtoSteps: steps })
                                                        }}
                                                        placeholder="Step name"
                                                        style={inputStyle}
                                                    />
                                                    <textarea
                                                        value={step.text}
                                                        onChange={(e) => {
                                                            const steps = [...schemaMetadata.howtoSteps]
                                                            steps[idx].text = e.target.value
                                                            setSchemaMetadata({ ...schemaMetadata, howtoSteps: steps })
                                                        }}
                                                        placeholder="Step instructions"
                                                        rows={2}
                                                        style={{ ...inputStyle, marginTop: '0.5rem', resize: 'vertical' }}
                                                    />
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => setSchemaMetadata({ ...schemaMetadata, howtoSteps: [...schemaMetadata.howtoSteps, { name: '', text: '' }] })}
                                                className="btn btn-outline"
                                                style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}
                                            >
                                                + Add Step
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
                                {loading ? 'Optimizing...' : <><Zap size={18} /> Optimize Content</>}
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
                        <div className="glass-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontWeight: '600' }}>Generated Schema</h3>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        Type: <span style={{ color: 'var(--accent-primary)' }}>{schemaResult.schema_type}</span>
                                    </span>
                                </div>
                                <button
                                    onClick={copySchemaToClipboard}
                                    className="btn btn-outline"
                                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                                >
                                    {schemaCopied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy HTML</>}
                                </button>
                            </div>
                            <pre style={{
                                background: 'rgba(0,0,0,0.4)',
                                borderRadius: '8px',
                                padding: '1rem',
                                overflow: 'auto',
                                maxHeight: '300px',
                                fontSize: '0.8rem',
                                color: '#a5f3fc',
                                fontFamily: 'Consolas, monospace'
                            }}>
                                {JSON.stringify(schemaResult.json_ld, null, 2)}
                            </pre>
                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                <p style={{ fontSize: '0.8rem', color: '#86efac' }}>
                                    ✅ Copy the HTML snippet and paste it in your page's <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>&lt;head&gt;</code> section.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Results Area */}
                    {activeTab !== 'schema' && (analysisResults || optimizedContent) && (
                        <div style={{ marginTop: '2rem' }}>
                            {/* Result Tabs */}
                            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}>
                                <button
                                    onClick={() => setViewMode('analysis')}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'none',
                                        border: 'none',
                                        borderBottom: viewMode === 'analysis' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                                        color: viewMode === 'analysis' ? 'white' : 'var(--text-secondary)',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    📊 Analysis
                                </button>
                                <button
                                    onClick={() => setViewMode('result')}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'none',
                                        border: 'none',
                                        borderBottom: viewMode === 'result' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                                        color: viewMode === 'result' ? 'white' : 'var(--text-secondary)',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ✨ Optimized
                                </button>
                                <button
                                    onClick={() => setViewMode('compare')}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'none',
                                        border: 'none',
                                        borderBottom: viewMode === 'compare' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                                        color: viewMode === 'compare' ? 'white' : 'var(--text-secondary)',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ⚖️ Compare
                                </button>
                            </div>

                            {viewMode === 'analysis' && analysisResults && (
                                <ResultsPanel results={analysisResults} onReset={() => setAnalysisResults(null)} context="text" />
                            )}

                            {viewMode === 'result' && optimizedContent && (
                                <div className="glass-card animate-fade-in" style={{ padding: '2rem', background: 'rgba(15, 23, 42, 0.4)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--accent-primary)' }}>
                                            {activeTab === 'rewrite' ? 'Rewritten Version' : 'Generated Article'}
                                        </h3>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {/* Copy Button */}
                                            <button
                                                className="btn btn-outline"
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
                                                        // Fallback toast or logic here if needed, or just let user know
                                                    } catch (err) {
                                                        console.error('Copy failed:', err)
                                                        navigator.clipboard.writeText(optimizedContent)
                                                    }
                                                }}
                                                style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem', gap: '0.25rem' }}
                                                title="Copy Formatted (for Word/Docs)"
                                            >
                                                <Copy size={14} /> Copy
                                            </button>
                                            {/* Download Markdown */}
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
                                                style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem', gap: '0.25rem' }}
                                                title="Download as Markdown"
                                            >
                                                <Download size={14} /> .md
                                            </button>
                                            {/* Download HTML */}
                                            <button
                                                className="btn btn-outline"
                                                onClick={() => {
                                                    // Convert markdown to basic HTML
                                                    let html = optimizedContent
                                                        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                                                        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                                                        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                                        .replace(/^\- (.*$)/gim, '<li>$1</li>')
                                                        .replace(/\n\n/g, '</p><p>')
                                                        .replace(/\n/g, '<br>')
                                                    html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Optimized Content</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; }
        h1, h2, h3 { color: #1a202c; }
        p { margin: 1rem 0; }
        li { margin: 0.5rem 0; }
    </style>
</head>
<body>
<p>${html}</p>
</body>
</html>`
                                                    const blob = new Blob([html], { type: 'text/html' })
                                                    const url = URL.createObjectURL(blob)
                                                    const a = document.createElement('a')
                                                    a.href = url
                                                    a.download = `optimized-content-${Date.now()}.html`
                                                    a.click()
                                                    URL.revokeObjectURL(url)
                                                }}
                                                style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem', gap: '0.25rem' }}
                                                title="Download as HTML"
                                            >
                                                <Download size={14} /> .html
                                            </button>
                                        </div>
                                    </div>
                                    <div className="markdown-content" ref={contentRef} style={{
                                        lineHeight: '1.7',
                                        color: '#e2e8f0',
                                        fontFamily: 'Inter, sans-serif'
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
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div style={{
                                            flex: 1,
                                            padding: '1rem',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            borderRadius: '8px',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{content.split(/\s+/).filter(Boolean).length}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Original Words</div>
                                        </div>
                                        <div style={{
                                            flex: 1,
                                            padding: '1rem',
                                            background: 'rgba(16, 185, 129, 0.1)',
                                            borderRadius: '8px',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{optimizedContent.split(/\s+/).filter(Boolean).length}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Optimized Words</div>
                                        </div>
                                    </div>

                                    {/* Side by Side */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)' }}>
                                            <h4 style={{ marginBottom: '1rem', color: 'var(--error)', fontWeight: '600' }}>📝 Original</h4>
                                            <div style={{
                                                whiteSpace: 'pre-wrap',
                                                fontSize: '0.9rem',
                                                lineHeight: '1.6',
                                                maxHeight: '400px',
                                                overflowY: 'auto'
                                            }}>
                                                {content}
                                            </div>
                                        </div>
                                        <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)' }}>
                                            <h4 style={{ marginBottom: '1rem', color: 'var(--success)', fontWeight: '600' }}>✨ Optimized</h4>
                                            <div className="markdown-content" style={{
                                                fontSize: '0.9rem',
                                                lineHeight: '1.6',
                                                maxHeight: '400px',
                                                overflowY: 'auto'
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* History Panel */}
                    <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{
                            padding: '1rem 1.5rem',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                                OPTIMIZATION HISTORY
                            </span>
                            <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.5rem', borderRadius: '10px' }}>
                                {history.length} items
                            </span>
                        </div>
                        {history.length === 0 ? (
                            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                No history found.
                            </div>
                        ) : (
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {history.map(item => (
                                    <div key={item.id} style={{
                                        padding: '1rem 1.5rem',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }} className="history-item">
                                        <div style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                                            {item.title || 'Untitled'}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                            <span style={{ color: item.score > 80 ? 'var(--success)' : 'var(--warning)' }}>
                                                Score: {item.score.toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Status/Ready Panel */}
                    <div style={{
                        border: '1px dashed rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '3rem 1.5rem',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '300px'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem'
                        }}>
                            <Sparkles size={24} color="var(--text-secondary)" />
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Ready to Optimize</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '200px' }}>
                            Enter your content or topic idea above to begin the optimization process. Result will appear here.
                        </p>
                    </div>
                </div>
            </div>
        </div >
    )
}

function InfoIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
    )
}

export default ContentOptimization
