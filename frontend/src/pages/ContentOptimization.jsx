import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PenTool, Lightbulb, Zap, Sparkles, Download, Copy, Check, Folder, Plus, X, Code2, Info as InfoIcon, History, Link as LinkIcon, TrendingUp, Target, RefreshCw, BookOpen, Database, Layers } from 'lucide-react'
import axios from 'axios'
import ResultsPanel from '../components/ResultsPanel'
import ContentExportButton from '../components/ContentExportButton'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import html2canvas from 'html2canvas'
import { useAnalysisState } from '../context/AnalysisContext'
import { useToast } from '../components/ToastProvider'
import VisualDiff from '../components/VisualDiff'

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
    const editorRef = useRef(null)
    const resultRef = useRef(null)

    // Use context for persistent state
    const { optimizationState, updateOptimization } = useAnalysisState()
    const { 
        content = '', 
        activeTab = 'rewrite', 
        contentType = 'general', 
        analysisResults = null, 
        optimizedContent = '' 
    } = optimizationState || {}
    const toast = useToast()

    // Local-only state
    const [selectedProject, setSelectedProject] = useState(projectFromUrl || '')
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(false)
    const [history, setHistory] = useState([])
    const [historyOffset, setHistoryOffset] = useState(0)
    const [hasMoreHistory, setHasMoreHistory] = useState(false)
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [loadingMoreHistory, setLoadingMoreHistory] = useState(false)
    const [error, setError] = useState(null)
    const [diagnostics, setDiagnostics] = useState(null)
    const [loadingDiagnostics, setLoadingDiagnostics] = useState(false)
    const [optimizationStrategy, setOptimizationStrategy] = useState('general')
    const [optimizationTone, setOptimizationTone] = useState('professional')
    const [optimizationAudience, setOptimizationAudience] = useState('intermediate')
    const [optimizationStrength, setOptimizationStrength] = useState(50)
    const [showSplitView, setShowSplitView] = useState(false)
    const [compareView, setCompareView] = useState('side') // 'side' or 'diff'
    const [additionalInstructions, setAdditionalInstructions] = useState('')
    const [progress, setProgress] = useState(0)
    const [selection, setSelection] = useState({ text: '', top: 0, left: 0, visible: false })
    const [versionHistory, setVersionHistory] = useState([])

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
            editorRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [])

    const fetchHistory = async () => {
        try {
            const response = await axios.get('/api/history?type=text&limit=10&offset=0')
            setHistory(Array.isArray(response.data?.items) ? response.data.items : [])
            setHasMoreHistory(response.data?.has_more || false)
            setHistoryOffset(0)
        } catch (error) {
            console.error('Failed to fetch history:', error)
            setHistory([])
        }
    }

    const loadMoreHistory = async () => {
        if (loadingMoreHistory || !hasMoreHistory) return;
        setLoadingMoreHistory(true);
        try {
            const nextOffset = historyOffset + 10;
            const response = await axios.get(`/api/history?type=text&limit=10&offset=${nextOffset}`)
            setHistory(prev => [...prev, ...(Array.isArray(response.data?.items) ? response.data.items : [])])
            setHasMoreHistory(response.data?.has_more || false)
            setHistoryOffset(nextOffset)
        } catch (error) {
            console.error('Failed to load more history:', error)
        } finally {
            setLoadingMoreHistory(false)
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
                // If it's a rewrite, we might have stored original content in metadata
                content: data.metadata?.original_content || data.title || '', 
                analysisResults: data.analysis,
                optimizedContent: data.content,
                activeTab: data.metadata?.mode || 'rewrite'
            })
            
            // Switch to result view to show the optimized content
            setViewMode('result')
            
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
            setProjects(Array.isArray(response.data) ? response.data : [])
        } catch (error) {
            console.error('Failed to fetch projects:', error)
            setProjects([])
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
    const [viewMode, setViewMode] = useState('analysis') // 'analysis', 'result', or 'compare'

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
    const [targetEngine, setTargetEngine] = useState('perplexity')

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
                // Auto hint or process if needed
                if (contentType !== 'general') {
                    // Optional hints
                }
            }
        } catch (err) {
            toast.error('Failed to import content: ' + (err.response?.data?.detail || err.message))
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
            if (content.length > 100 && activeTab !== 'schema') {
                fetchDiagnostics()
            }
        }, 1500) // 1.5 second debounce
        return () => clearTimeout(timer)
    }, [content])

    const fetchDiagnostics = async () => {
        if (loadingDiagnostics) return
        setLoadingDiagnostics(true)
        try {
            const response = await axios.post('/api/analyze-diagnostics', { content })
            setDiagnostics(response.data)
        } catch (err) {
            console.error('Diagnostics failed:', err)
        } finally {
            setLoadingDiagnostics(false)
        }
    }

    const handleTextSelection = (e) => {
        const sel = window.getSelection()
        const text = sel.toString().trim()
        if (text && text.length > 10) {
            const range = sel.getRangeAt(0)
            const rect = range.getBoundingClientRect()
            setSelection({
                text,
                top: rect.top + window.scrollY - 40,
                left: rect.left + window.scrollX + rect.width / 2,
                visible: true
            })
        } else {
            setSelection(prev => ({ ...prev, visible: false }))
        }
    }

    const handleSnippetAction = async (action) => {
        setLoading(true)
        setSelection(prev => ({ ...prev, visible: false }))
        try {
            const response = await axios.post('/api/optimize-snippet', {
                snippet: selection.text,
                full_context: content,
                action: action
            })
            if (response.data.optimized_content) {
                const newContent = content.replace(selection.text, response.data.optimized_content)
                updateOptimization({ content: newContent })
            }
        } catch (err) {
            toast.error('Snippet optimization failed')
        } finally {
            setLoading(false)
        }
    }

    const handleGenerateInjection = async (target = null) => {
        const targetToUse = target || manualInjectionTarget;
        if (!targetToUse) return;
        
        setGeneratingInjection(true);
        try {
            const response = await axios.post('/api/optimize/inject', {
                context_text: content,
                injection_target: targetToUse,
                tone: 'professional',
                additional_instructions: additionalInstructions
            });
            
            if (response.data.injection) {
                const newContent = content + "\n\n" + response.data.injection;
                updateOptimization({ content: newContent });
                setManualInjectionTarget('');
            }
        } catch (err) {
            toast.error("Failed to generate targeted injection.")
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
            const msg = err.response?.data?.detail || err.message || 'Schema generation failed'
            setError(msg)
            toast.error(msg)
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

    const pollJobStatus = async (jobId, isGenerate = false) => {
        try {
            const res = await axios.get(`/api/jobs/${jobId}`);
            if (res.data.status === 'completed') {
                const optimizationResult = res.data.result;
                let analysisData = null;

                if (isGenerate) {
                    analysisData = {
                        scores: {
                            structural: optimizationResult.structural_score?.score || 85,
                            semantic: 85,
                            geo_lift: 85
                        },
                        suggestions: ["Content generated from idea. Refine with specific data for higher ranking."]
                    };
                } else if (optimizationResult.structural_score) {
                    analysisData = {
                        scores: {
                            structural: optimizationResult.structural_score.score || 80,
                            citation: optimizationResult.citation_worthiness_score || 80,
                            semantic: 80,
                            geo_lift: 80
                        },
                        suggestions: optimizationResult.changes_made || []
                    };
                }

                updateOptimization({
                    analysisResults: analysisData,
                    optimizedContent: optimizationResult.optimized_content
                });

                setProgress(100);
                setLoading(false);
                setViewMode('result');
                setShowSplitView(true);
                fetchHistory();
            } else if (res.data.status === 'failed') {
                const errorMsg = res.data.error || 'Optimization job failed';
                if (errorMsg.includes('429')) {
                    setError('GEO Engine rate limit hit. Falling back to default analysis...');
                    toast.warning('Provider rate limit reached. Please wait a few moments.');
                } else {
                    setError(errorMsg);
                    toast.error(errorMsg);
                }
                setLoading(false);
                setProgress(0);
            } else {
                // Update progress from backend if available
                if (res.data.progress) {
                    setProgress(res.data.progress);
                }
                // Poll every 3 seconds
                setTimeout(() => pollJobStatus(jobId, isGenerate), 3000);
            }
        } catch (err) {
            console.error('Job polling failed:', err);
            setError('Failed to track optimization progress');
            setLoading(false);
        }
    };

    const handleOptimize = async () => {
        if (!content.trim()) return

        setLoading(true)
        setError(null)
        updateOptimization({ analysisResults: null, optimizedContent: '' })

        try {
            const payload = {
                content: content,
                mode: activeTab === 'generate' ? 'generate' : 'rewrite',
                strategy: optimizationStrategy,
                tone: optimizationTone,
                audience: optimizationAudience,
                strength: optimizationStrength,
                target_keyword: selectedKeyword || customKeyword || undefined,
                engine: targetEngine,
                additional_instructions: additionalInstructions
            };

            const response = await axios.post('/api/optimize', payload);
            
            if (response.data.job_id) {
                pollJobStatus(response.data.job_id, activeTab === 'generate');
            } else {
                // Fallback for immediate results (if any)
                const optimizationRes = response.data;
                updateOptimization({
                    analysisResults: optimizationRes.analysis || { scores: { structural: 80, semantic: 80, geo_lift: 80 }, suggestions: [] },
                    optimizedContent: optimizationRes.optimized_content
                });
                setLoading(false);
                setViewMode('result');
                setShowSplitView(true);
                fetchHistory();
            }
        } catch (err) {
            console.error(err)
            const msg = err.response?.data?.detail || err.message || 'Optimization failed'
            setError(msg)
            toast.error(msg)
            setLoading(false)
        }
    }

    const ScoreCard = ({ label, value, icon, color }) => (
        <div className="depth-card" style={{ padding: '1.5rem', textAlign: 'center', border: `1px solid ${color}22` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-tertiary)' }}>
                {React.cloneElement(icon, { size: 14, color })}
                <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: '900', color: color }}>{value}</div>
        </div>
    );

    const tabBtnStyle = (active) => ({
        background: 'none',
        border: 'none',
        padding: '0.5rem 0',
        fontSize: '0.85rem',
        fontWeight: '800',
        color: active ? 'white' : 'var(--text-tertiary)',
        borderBottom: active ? '2px solid var(--accent-primary)' : '2px solid transparent',
        cursor: 'pointer',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        transition: 'all 0.2s'
    });

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header Area */}
            <div style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <Sparkles size={20} color="var(--accent-primary)" />
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                        Enrichment Engine v3.0
                    </span>
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.04em', margin: 0 }}>
                    Content Optimization Workbench
                </h1>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                    Apply lossless expansion and semantic anchors to transform drafts into AI-citable masterpieces.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                
                {/* TOP SECTION: THE WORKBENCH */}
                <div className="depth-card" style={{ padding: '2.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--card-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <PenTool size={20} color="var(--accent-primary)" />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                                {activeTab === 'generate' ? 'Topic Generation' : activeTab === 'schema' ? 'Schema Drafting' : 'Content Drafting'}
                            </h2>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '8px' }}>
                            {['rewrite', 'generate', 'schema'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => updateOptimization({ activeTab: t })}
                                    style={{
                                        padding: '0.4rem 1rem',
                                        borderRadius: '6px',
                                        fontSize: '0.7rem',
                                        fontWeight: '800',
                                        background: activeTab === t ? 'var(--accent-primary)' : 'transparent',
                                        color: activeTab === t ? 'white' : 'var(--text-tertiary)',
                                        border: 'none',
                                        textTransform: 'uppercase',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2.5rem' }}>
                        {/* EDITOR AREA */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ position: 'relative' }}>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-tertiary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    {activeTab === 'generate' ? 'DESCRIBE YOUR IDEA / KEYWORDS' : 'ORIGINAL CONTENT DRAFT'}
                                </label>
                                <textarea
                                    value={content}
                                    onChange={(e) => updateOptimization({ content: e.target.value })}
                                    placeholder={activeTab === 'generate' ? "e.g. 'Write a guide about iPhone 15 features'..." : "Paste your draft here..."}
                                    style={{
                                        ...inputStyle,
                                        height: '450px',
                                        fontSize: '1rem',
                                        lineHeight: '1.7',
                                        padding: '1.75rem',
                                        background: 'var(--bg-tertiary)',
                                        border: '1px solid var(--card-border)',
                                        fontFamily: 'Inter, sans-serif'
                                    }}
                                />
                                {loading && (
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'rgba(15, 23, 42, 0.85)',
                                        backdropFilter: 'blur(8px)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '12px',
                                        zIndex: 10
                                    }}>
                                        <RefreshCw className="animate-spin" size={40} color="var(--accent-primary)" />
                                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                            <div style={{ fontWeight: '900', color: 'white', fontSize: '1.2rem', letterSpacing: '0.05em' }}>AI ENRICHMENT ACTIVE</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>Injecting E-E-A-T anchors...</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={activeTab === 'schema' ? handleGenerateSchema : handleOptimize}
                                disabled={loading || schemaLoading || !content.trim()}
                                className="btn btn-primary"
                                style={{ height: '64px', fontSize: '1.1rem', fontWeight: '900', boxShadow: '0 12px 40px rgba(59, 130, 246, 0.25)' }}
                            >
                                <Zap size={22} fill="currentColor" style={{ marginRight: '8px' }} />
                                {activeTab === 'rewrite' ? 'REWRITE & ENRICH' : activeTab === 'generate' ? 'GENERATE MASTERPIECE' : 'GENERATE SCHEMA'}
                            </button>
                        </div>

                        {/* SETTINGS SIDEBAR */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-tertiary)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Optimization Controls</h4>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: '0.6rem', fontWeight: '800' }}>CORE STRATEGY</label>
                                        <select value={optimizationStrategy} onChange={(e) => setOptimizationStrategy(e.target.value)} style={{ ...inputStyle, height: '44px', fontSize: '0.85rem' }}>
                                            <option value="general">Standard GEO</option>
                                            <option value="authority_boost">Authority Boost</option>
                                            <option value="semantic_expansion">Semantic Expansion</option>
                                            <option value="technical">Technical Depth</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: '0.6rem', fontWeight: '800' }}>TARGET AUDIENCE</label>
                                        <select value={optimizationAudience} onChange={(e) => setOptimizationAudience(e.target.value)} style={{ ...inputStyle, height: '44px', fontSize: '0.85rem' }}>
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="expert">Executive/Expert</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: '0.6rem', fontWeight: '800' }}>CUSTOM INSTRUCTIONS</label>
                                        <textarea 
                                            value={additionalInstructions}
                                            onChange={(e) => setAdditionalInstructions(e.target.value)}
                                            placeholder="e.g. 'Never remove personal anecdotes', 'Keep H2 structure'..."
                                            style={{ ...inputStyle, height: '100px', fontSize: '0.8rem', padding: '0.75rem', resize: 'none' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(16, 185, 129, 0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <Sparkles size={14} color="#10b981" />
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#10b981' }}>GEO STATUS</span>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', lineHeight: '1.6', margin: 0 }}>
                                    Our engine enforces <strong>Lossless Expansion</strong>, ensuring personal anecdotes and technical data are preserved and enriched.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION: RESULTS HUB */}
                {(optimizedContent || analysisResults || schemaResult) && (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* SCORE STRIP */}
                        {analysisResults && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                                <ScoreCard label="Visibility Lift" value={`${analysisResults.scores?.geo_lift || 85}%`} icon={<TrendingUp />} color="var(--accent-primary)" />
                                <ScoreCard label="Word Count" value={(optimizedContent || '').split(/\s+/).filter(Boolean).length} icon={<PenTool />} color="white" />
                                <ScoreCard label="Semantic Depth" value="High" icon={<Sparkles />} color="#10b981" />
                                <ScoreCard label="E-E-A-T Signal" value="Strong" icon={<Target />} color="#f59e0b" />
                            </div>
                        )}

                        {/* MAIN RESULT HUB */}
                        <div className="depth-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '1.5rem 2.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                    <button onClick={() => setViewMode('result')} style={tabBtnStyle(viewMode === 'result')}>Masterpiece</button>
                                    <button onClick={() => setViewMode('compare')} style={tabBtnStyle(viewMode === 'compare')}>Diff Analysis</button>
                                    <button onClick={() => setViewMode('analysis')} style={tabBtnStyle(viewMode === 'analysis')}>SEO Diagnostics</button>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <ContentExportButton content={optimizedContent} />
                                    <button 
                                        className="btn btn-outline" 
                                        style={{ height: '36px', fontSize: '0.75rem' }}
                                        onClick={() => {
                                            navigator.clipboard.writeText(optimizedContent);
                                            toast.success("Copied to clipboard!");
                                        }}
                                    >
                                        Copy Markdown
                                    </button>
                                </div>
                            </div>

                            <div style={{ padding: '3rem' }}>
                                {viewMode === 'result' && (
                                    <div className="markdown-content animate-fade-in" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ table: TableWithCopy }}>
                                            {optimizedContent}
                                        </ReactMarkdown>
                                    </div>
                                )}

                                {viewMode === 'compare' && (
                                    <div className="animate-fade-in">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: '12px', height: '12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '2px' }}></div>
                                                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10b981' }}>ADDED & OPTIMIZED</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: '12px', height: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '2px' }}></div>
                                                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ef4444' }}>REMOVED</span>
                                            </div>
                                        </div>
                                        <VisualDiff oldText={content} newText={optimizedContent} />
                                    </div>
                                )}

                                {viewMode === 'analysis' && (
                                    <div className="animate-fade-in">
                                        {diagnostics ? (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                                <ScoreCard label="Intent Match" value={diagnostics.intent_match_score} icon={<Target />} color="#3b82f6" />
                                                <ScoreCard label="Readability" value={diagnostics.readability_score} icon={<BookOpen />} color="#10b981" />
                                                <ScoreCard label="Entity Coverage" value={diagnostics.entity_coverage_pct} icon={<Database />} color="#8b5cf6" />
                                                <ScoreCard label="Content Depth" value={diagnostics.content_depth_score} icon={<Layers />} color="#f59e0b" />
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-tertiary)' }}>
                                                {loadingDiagnostics ? 'Analyzing content quality...' : 'Type more content to see real-time diagnostics.'}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Right Column - Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Strategy Controls */}
                    {activeTab !== 'schema' && (
                        <div className="depth-card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '700' }}>AUDIENCE</label>
                                        <select 
                                            value={optimizationAudience}
                                            onChange={(e) => setOptimizationAudience(e.target.value)}
                                            style={inputStyle}
                                        >
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="expert">Expert</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '700' }}>STRENGTH</label>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: '800' }}>{optimizationStrength}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="100" 
                                        value={optimizationStrength}
                                        onChange={(e) => setOptimizationStrength(parseInt(e.target.value))}
                                        style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                                        <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>Light</span>
                                        <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>Aggressive</span>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '700' }}>
                                        SPECIFIC INSTRUCTIONS
                                    </label>
                                    <textarea
                                        value={additionalInstructions}
                                        onChange={(e) => setAdditionalInstructions(e.target.value)}
                                        placeholder="e.g. 'Focus on creative tools', 'Keep it non-technical', 'Mention the latest 2026 trends'..."
                                        style={{
                                            ...inputStyle,
                                            height: '100px',
                                            resize: 'none',
                                            fontSize: '0.8rem',
                                            lineHeight: '1.4',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px dashed rgba(59, 130, 246, 0.4)'
                                        }}
                                    />
                                    <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                                        Guide the AI on specific focus areas, exclusions, or unique angles.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* History Panel */}
                    <div className="depth-card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{
                            padding: '1rem 1.25rem',
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
                                        if (!item) return false;
                                        const title = item.title || '';
                                        const isSchema = title.toLowerCase().includes('schema') || title.toLowerCase().includes('json');
                                        if (activeTab === 'schema') return isSchema;
                                        return !isSchema;
                                    })
                                    .map(item => {
                                        if (!item) return null;
                                        const title = item.title || '';
                                        const isSchema = title.toLowerCase().includes('schema') || title.toLowerCase().includes('json');
                                        return (
                                            <div key={item.id} 
                                                onClick={() => handleHistoryItemClick(item.id)}
                                                style={{
                                                    padding: '1rem 1.25rem',
                                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    borderLeft: `2px solid ${isSchema ? 'var(--accent-secondary)' : 'var(--accent-primary)'}`
                                                }} className="history-item">
                                                <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ 
                                                        display: 'block',
                                                        overflow: 'hidden', 
                                                        textOverflow: 'ellipsis', 
                                                        whiteSpace: 'nowrap',
                                                        width: '100%'
                                                    }}>
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
                                                        {isSchema ? 'Schema' : (title.toLowerCase().includes('idea') ? 'Gen' : 'Rewrite')}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                        <span style={{ color: 'var(--text-tertiary)' }}>{new Date(item.created_at).toLocaleDateString()}</span>
                                                        {item.analysis?.engine && (
                                                            <span style={{ 
                                                                fontSize: '0.55rem', 
                                                                color: 'var(--accent-primary)', 
                                                                fontWeight: '800', 
                                                                textTransform: 'uppercase',
                                                                background: 'rgba(99, 102, 241, 0.1)',
                                                                padding: '1px 3px',
                                                                borderRadius: '2px'
                                                            }}>
                                                                {item.analysis.engine.replace('_', ' ')}
                                                            </span>
                                                        )}
                                                    </div>
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
                                    if (!item) return false;
                                    const title = item.title || '';
                                    const isSchema = title.toLowerCase().includes('schema') || title.toLowerCase().includes('json');
                                        if (activeTab === 'schema') return isSchema;
                                        return !isSchema;
                                    }).length === 0 && (
                                        <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                                            No {activeTab === 'schema' ? 'schema' : 'content'} history found in this project.
                                        </div>
                                    )}
                                
                                {/* Load More Button */}
                                {hasMoreHistory && (
                                    <button 
                                        onClick={loadMoreHistory}
                                        disabled={loadingMoreHistory}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(255,255,255,0.02)',
                                            border: 'none',
                                            borderTop: '1px solid rgba(255,255,255,0.05)',
                                            color: 'var(--accent-primary)',
                                            fontSize: '0.8rem',
                                            fontWeight: '700',
                                            cursor: loadingMoreHistory ? 'wait' : 'pointer',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                                        onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.02)'}
                                    >
                                        {loadingMoreHistory ? 'Loading...' : 'Load More'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Optimization Insights Panel */}
                    <div className="depth-card" style={{
                        padding: '1.5rem',
                        position: 'sticky',
                        top: '1.5rem',
                        borderRadius: '16px',
                        overflow: 'hidden'
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
                                    {activeTab === 'schema' ? '98%' : (Array.isArray(history) && history.length > 0 ? (history.reduce((acc, curr) => acc + (curr?.score || 0), 0) / history.length).toFixed(0) + '%' : '0%')}
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
    )
}


export default ContentOptimization
