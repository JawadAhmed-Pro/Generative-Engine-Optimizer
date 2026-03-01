import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Link as LinkIcon, Calendar, TrendingUp, Trash2, Filter, ArrowUpDown, Search, ExternalLink, Eye, PenTool, Zap } from 'lucide-react'
import axios from 'axios'
import AnalysisModal from '../components/AnalysisModal'

function ProjectDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [project, setProject] = useState(null)
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [deleting, setDeleting] = useState(false)

    // Filter and Sort state
    const [filterType, setFilterType] = useState('all') // 'all', 'url', 'text'
    const [sortBy, setSortBy] = useState('date') // 'date', 'score'
    const [sortOrder, setSortOrder] = useState('desc') // 'asc', 'desc'
    const [selectedItem, setSelectedItem] = useState(null)

    useEffect(() => {
        fetchProjectDetails()
    }, [id])

    const fetchProjectDetails = async () => {
        try {
            const [projectRes, itemsRes] = await Promise.all([
                axios.get(`/api/projects/${id}`),
                axios.get(`/api/projects/${id}/items`)
            ])
            setProject(projectRes.data)
            setItems(itemsRes.data.items || [])
        } catch (err) {
            setError('Failed to load project')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${project?.name}"?`)) return

        setDeleting(true)
        try {
            await axios.delete(`/api/projects/${id}`)
            navigate('/app/projects')
        } catch (err) {
            alert('Failed to delete project')
            setDeleting(false)
        }
    }

    // Filter and Sort items
    const filteredItems = items
        .filter(item => {
            if (filterType === 'all') return true
            if (filterType === 'url') return !!item.url
            if (filterType === 'text') return !item.url
            return true
        })
        .sort((a, b) => {
            if (sortBy === 'date') {
                const dateA = new Date(a.created_at)
                const dateB = new Date(b.created_at)
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
            }
            if (sortBy === 'score') {
                const scoreA = a.score || 0
                const scoreB = b.score || 0
                return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB
            }
            return 0
        })

    const avgScore = items.length > 0
        ? (items.reduce((sum, item) => sum + (item.score || 0), 0) / items.length).toFixed(1)
        : 0

    const urlCount = items.filter(i => i.url).length
    const textCount = items.filter(i => !i.url).length

    const getScoreColor = (score) => {
        if (!score) return 'var(--text-secondary)'
        if (score >= 70) return 'var(--success)'
        if (score >= 50) return 'var(--warning)'
        return 'var(--error)'
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Loading project...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--error)' }}>{error}</p>
                <Link to="/app/projects" className="btn btn-outline" style={{ marginTop: '1rem' }}>
                    Back to Projects
                </Link>
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link to="/app/projects" style={{ color: 'var(--text-secondary)' }}>
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>{project?.name}</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>{project?.description || 'No description'}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link to={`/app/visibility?project=${id}`} className="btn btn-outline">
                        <Eye size={16} style={{ marginRight: '0.5rem' }} /> Analyze URL
                    </Link>
                    <Link to={`/app/optimization?project=${id}`} className="btn btn-outline">
                        <PenTool size={16} style={{ marginRight: '0.5rem' }} /> Optimize Content
                    </Link>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="btn btn-outline"
                        style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
                        {items.length}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Total Items</div>
                </div>
                <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: getScoreColor(parseFloat(avgScore)) }}>
                        {avgScore}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Avg Score</div>
                </div>
                <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700' }}>{urlCount}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>URL Analyses</div>
                </div>
                <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700' }}>{textCount}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Text Optimizations</div>
                </div>
            </div>

            {/* Items List */}
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                {/* Header with filters */}
                <div style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ fontWeight: '600' }}>Content Items ({filteredItems.length})</h3>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {/* Type Filter */}
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            style={{
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'var(--text-primary)',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '6px',
                                fontSize: '0.875rem'
                            }}
                        >
                            <option value="all">All Types</option>
                            <option value="url">URLs Only</option>
                            <option value="text">Text Only</option>
                        </select>

                        {/* Sort */}
                        <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [newSort, newOrder] = e.target.value.split('-')
                                setSortBy(newSort)
                                setSortOrder(newOrder)
                            }}
                            style={{
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'var(--text-primary)',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '6px',
                                fontSize: '0.875rem'
                            }}
                        >
                            <option value="date-desc">Newest First</option>
                            <option value="date-asc">Oldest First</option>
                            <option value="score-desc">Highest Score</option>
                            <option value="score-asc">Lowest Score</option>
                        </select>
                    </div>
                </div>

                {filteredItems.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem'
                        }}>
                            <FileText size={28} color="var(--text-secondary)" />
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            {items.length === 0
                                ? 'No items in this project yet.'
                                : 'No items match your filter.'}
                        </p>
                        {items.length === 0 && (
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <Link to="/app/visibility" className="btn btn-primary">
                                    <Search size={16} style={{ marginRight: '0.5rem' }} /> Analyze URL
                                </Link>
                                <Link to="/app/optimization" className="btn btn-outline">
                                    <PenTool size={16} style={{ marginRight: '0.5rem' }} /> Optimize Content
                                </Link>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedItem(item.id)}
                                style={{
                                    padding: '1rem 1.5rem',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    transition: 'background 0.2s',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    background: item.url ? 'rgba(59, 130, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {item.url ? <LinkIcon size={20} color="var(--accent-primary)" /> : <FileText size={20} color="var(--accent-secondary)" />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                                        {item.title || (item.url ? new URL(item.url).hostname : 'Untitled')}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                        {item.url && (
                                            <span style={{ marginRight: '1rem' }}>{item.url.substring(0, 50)}...</span>
                                        )}
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Calendar size={11} /> {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    background: 'rgba(0,0,0,0.2)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: getScoreColor(item.score) }}>
                                        {item.score?.toFixed(0) || '—'}
                                    </div>
                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>SCORE</div>
                                </div>
                                <div style={{
                                    padding: '0.25rem 0.75rem',
                                    background: item.url ? 'rgba(59, 130, 246, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                                    borderRadius: '20px',
                                    fontSize: '0.7rem',
                                    fontWeight: '600',
                                    color: item.url ? 'var(--accent-primary)' : 'var(--accent-secondary)'
                                }}>
                                    {item.url ? 'URL' : 'TEXT'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Analysis Modal */}
            {selectedItem && (
                <AnalysisModal
                    itemId={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </div>
    )
}

export default ProjectDetail
