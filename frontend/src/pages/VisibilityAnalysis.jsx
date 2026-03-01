import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Link as LinkIcon, Info, Folder, Plus, X } from 'lucide-react'
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
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Visibility Analysis</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Analyze how AI search engines perceive your content</p>
            </div>

            {/* Domain Selector */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => updateVisibility({ contentType: 'educational' })}
                    className={`btn ${contentType === 'educational' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ gap: '0.5rem', flex: 1 }}
                >
                    📚 Education
                </button>
                <button
                    onClick={() => updateVisibility({ contentType: 'ecommerce' })}
                    className={`btn ${contentType === 'ecommerce' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ gap: '0.5rem', flex: 1 }}
                >
                    🛒 E-commerce
                </button>
                <button
                    onClick={() => updateVisibility({ contentType: 'general' })}
                    className={`btn ${contentType === 'general' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ gap: '0.5rem', flex: 1 }}
                >
                    📝 General / Blog
                </button>
            </div>


            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Left Column - Input */}
                <div>
                    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ marginBottom: '0.75rem', fontWeight: '600' }}>
                            <span>Target URL</span>
                        </div>

                        <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                            <div style={{
                                position: 'absolute',
                                left: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-secondary)'
                            }}>
                                <LinkIcon size={18} />
                            </div>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => updateVisibility({ url: e.target.value })}
                                placeholder="https://www.example.com/blog/article-slug"
                                style={{
                                    width: '100%',
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    padding: '0.875rem 1rem 0.875rem 3rem',
                                    color: 'var(--text-primary)',
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '1rem'
                        }}>
                            <Info size={14} /> Enter the full public URL of the page you want to analyze for search visibility.
                        </div>

                        {/* Project Selector */}
                        <div style={{ marginBottom: '0.5rem' }}>
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
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !url.trim()}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem', marginBottom: '2rem' }}
                    >
                        {loading ? 'Analyzing...' : <><Search size={18} /> Analyze Visibility</>}
                    </button>

                    {error && (
                        <div style={{ marginBottom: '2rem', color: 'var(--error)', fontSize: '0.9rem' }}>
                            Error: {error}
                        </div>
                    )}

                    {/* Results Area */}
                    {analysisResults ? (
                        <ResultsPanel results={analysisResults} onReset={() => updateVisibility({ analysisResults: null })} />
                    ) : (
                        <div className="glass-card" style={{ minHeight: '400px', background: 'rgba(15, 23, 42, 0.3)' }}>
                            {/* Empty state placeholder */}
                        </div>
                    )}
                </div>

                {/* Right Column - Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* History Panel */}
                    <div className="glass-card" style={{ padding: '0', overflow: 'hidden', height: '100%' }}>
                        <div style={{
                            padding: '1rem 1.5rem',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                                ANALYSIS HISTORY
                            </span>
                            <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.5rem', borderRadius: '10px' }}>
                                {history.length} items
                            </span>
                        </div>
                        {history.length === 0 ? (
                            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4rem' }}>
                                No history found.
                            </div>
                        ) : (
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {history.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedHistoryItem(item.id)}
                                        style={{
                                            padding: '1rem 1.5rem',
                                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                                            cursor: 'pointer'
                                        }}
                                        className="history-item"
                                    >
                                        <div style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.25rem', wordBreak: 'break-all' }}>
                                            {item.url || item.title}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                            <span style={{ color: item.score > 80 ? 'var(--success)' : 'var(--warning)' }}>
                                                Score: {item.score?.toFixed(1) || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
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
