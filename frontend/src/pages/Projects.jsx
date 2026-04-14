import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Folder, X, Loader2, Sparkles, ChevronRight, Calendar, Activity, Clock, MoreVertical, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

export default function Projects() {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newProjectName, setNewProjectName] = useState('')
    const [newProjectDesc, setNewProjectDesc] = useState('')
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        try {
            const response = await axios.get('/api/projects')
            setProjects(response.data)
        } catch (error) {
            console.error('Failed to fetch projects:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateProject = async (e) => {
        e.preventDefault()
        if (!newProjectName.trim()) return

        setCreating(true)
        try {
            await axios.post('/api/projects', {
                name: newProjectName,
                description: newProjectDesc || "Workspace campaign"
            })
            setNewProjectName('')
            setNewProjectDesc('')
            setShowCreateModal(false)
            fetchProjects()
        } catch (error) {
            console.error('Failed to create project:', error)
        } finally {
            setCreating(false)
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="animate-fade-in"
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', marginTop: '0' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Sparkles size={18} color="var(--accent-primary)" />
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                            GEO Perception Layer
                        </span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.25rem', letterSpacing: '-0.04em' }}>Workspace Projects</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Manage and organize your optimization campaigns.</p>
                </div>
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                    style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={18} /> <span>New Project</span>
                </motion.button>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10rem 0' }}>
                    <Loader2 className="animate-spin" size={40} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
                    <span style={{ color: 'var(--text-secondary)', fontWeight: '600', letterSpacing: '0.05em' }}>SYNCING WORKSPACE...</span>
                </div>
            ) : projects.length === 0 ? (
                /* Empty State */
                <motion.div 
                    variants={itemVariants}
                    className="depth-card" 
                    style={{
                        minHeight: '450px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px dashed var(--bg-tertiary)'
                    }}
                >
                    <div style={{
                        width: '100px',
                        height: '100px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '2rem',
                        border: '1px solid var(--card-border)'
                    }}>
                        <Folder size={48} color="var(--text-tertiary)" strokeWidth={1.5} />
                    </div>

                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Initialize your first project</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', textAlign: 'center', maxWidth: '400px', lineHeight: '1.6' }}>
                        Transform your AI visibility by organizing your URLs and content into strategic workspace containers.
                    </p>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn btn-primary"
                        style={{ padding: '0.85rem 2.5rem' }}
                    >
                        Create Project Prototype
                    </button>
                </motion.div>
            ) : (
                /* Projects Grid */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                    {projects.map(project => (
                        <motion.div
                            key={project.id}
                            variants={itemVariants}
                        >
                            <Link
                                to={`/app/projects/${project.id}`}
                                style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}
                            >
                                <div className="glass-card" style={{ 
                                    padding: '1.75rem', 
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative',
                                    border: '1px solid var(--card-border)',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ 
                                        position: 'absolute', 
                                        top: 0, 
                                        right: 0, 
                                        width: '100px', 
                                        height: '100px', 
                                        background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.05), transparent)', 
                                        pointerEvents: 'none' 
                                    }} />

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div style={{
                                            width: '44px',
                                            height: '44px',
                                            background: 'var(--bg-tertiary)',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '1px solid var(--card-border)'
                                        }}>
                                            <Folder size={22} color="var(--accent-primary)" />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: '600' }}>
                                            <Calendar size={14} />
                                            {new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>{project.name}</h3>
                                            <ChevronRight size={18} color="var(--text-tertiary)" />
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {project.description || 'Enterprise campaign workspace for AI optimization.'}
                                        </p>
                                    </div>

                                    <div style={{ 
                                        marginTop: 'auto', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '1rem', 
                                        paddingTop: '1.25rem', 
                                        borderTop: '1px solid var(--card-border)' 
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                            <Activity size={14} color="var(--success)" />
                                            <span>ACTIVE</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                            <Clock size={14} />
                                            <span>RECENT UPDATES</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.85)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10000,
                            backdropFilter: 'blur(10px)',
                            padding: '1rem'
                        }}
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="glass-card" 
                            style={{ 
                                width: '100%',
                                maxWidth: '480px', 
                                padding: '2.5rem',
                                border: '1px solid var(--card-border)',
                                background: 'var(--bg-secondary)',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.25rem' }}>Create Workspace</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Initialize a new optimization campaign.</p>
                                </div>
                                <button 
                                    onClick={() => setShowCreateModal(false)} 
                                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateProject}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Project Identity</label>
                                    <input
                                        type="text"
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        placeholder="Target Brand or Campaign Name"
                                        autoFocus
                                        required
                                        style={{
                                            width: '100%',
                                            background: 'var(--bg-tertiary)',
                                            border: '1px solid var(--card-border)',
                                            borderRadius: '12px',
                                            padding: '1rem 1.25rem',
                                            color: 'var(--text-primary)',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                                        onBlur={e => e.target.style.borderColor = 'var(--card-border)'}
                                    />
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Workspace Context</label>
                                    <textarea
                                        value={newProjectDesc}
                                        onChange={(e) => setNewProjectDesc(e.target.value)}
                                        placeholder="Optional campaign description..."
                                        style={{
                                            width: '100%',
                                            background: 'var(--bg-tertiary)',
                                            border: '1px solid var(--card-border)',
                                            borderRadius: '12px',
                                            padding: '1rem 1.25rem',
                                            color: 'var(--text-primary)',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            minHeight: '100px',
                                            resize: 'none',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                                        onBlur={e => e.target.style.borderColor = 'var(--card-border)'}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="btn btn-outline"
                                        style={{ flex: 1, padding: '1rem' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating || !newProjectName.trim()}
                                        className="btn btn-primary"
                                        style={{ flex: 2, padding: '1rem' }}
                                    >
                                        {creating ? 'Initializing...' : 'Initialize Workspace'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
