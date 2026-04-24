import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search, BookOpen, BarChart2, Edit3, ChevronDown, Table, Target, Globe, ArrowRight, Zap, Info, ShoppingCart, TrendingUp, AlertTriangle, RefreshCw as RefreshCwIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAnalysisState } from '../context/AnalysisContext';

export default function ContentStrategy() {
    const [keyword, setKeyword] = useState('');
    const [niche, setNiche] = useState('general');
    const [prompts, setPrompts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();
    const { updateOptimization } = useAnalysisState();

    const nicheConfigs = {
        general: { label: 'General / Blog', icon: <Globe size={16} /> },
        education: { label: 'Education', icon: <BookOpen size={16} /> },
        ecommerce: { label: 'E-commerce', icon: <ShoppingCart size={16} /> }
    };

    const handleWriteContent = (promptText, nicheValue) => {
        let cType = 'general';
        if (nicheValue === 'ecommerce') cType = 'ecommerce';
        else if (nicheValue === 'education') cType = 'educational';
        
        updateOptimization({
            content: promptText,
            activeTab: 'generate',
            contentType: cType,
            analysisResults: null,
            optimizedContent: ''
        });
        navigate('/optimize');
    };

    const pollJobStatus = async (jobId) => {
        try {
            const res = await axios.get(`/api/jobs/${jobId}`);
            if (res.data.status === 'completed') {
                setPrompts(res.data.result.prompts || []);
                setIsLoading(false);
            } else if (res.data.status === 'failed') {
                setError(res.data.error || 'Job failed');
                setIsLoading(false);
            } else {
                setTimeout(() => pollJobStatus(jobId), 2000);
            }
        } catch (err) {
            setError('Failed to fetch job status');
            setIsLoading(false);
        }
    };

    const handleDiscover = async (e) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        setIsLoading(true);
        setError('');
        setPrompts([]);

        try {
            const response = await axios.post('/api/discover-prompts', { keyword, niche });
            if (response.data.job_id) {
                pollJobStatus(response.data.job_id);
            } else {
                setPrompts(response.data.prompts || response.data.data?.top_prompts || []);
                setIsLoading(false);
            }
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to discover prompts');
            setIsLoading(false);
        }
    };

    const getVolumeColor = (volume) => {
        switch (volume?.toLowerCase()) {
            case 'high': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' };
            case 'medium': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' };
            case 'low': return { bg: 'rgba(148, 163, 184, 0.1)', color: 'var(--text-secondary)', border: '1px solid rgba(148, 163, 184, 0.2)' };
            default: return { bg: 'rgba(148, 163, 184, 0.1)', color: 'var(--text-secondary)', border: '1px solid rgba(148, 163, 184, 0.2)' };
        }
    };

    return (
        <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '0', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Sparkles size={24} color="var(--accent-primary)" />
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                            GEO Perception Layer
                        </span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.04em', margin: 0 }}>
                        Content Strategy
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '0.4rem', whiteSpace: 'nowrap' }}>
                        Discover strategic content opportunities by uncovering what users are actually asking AI platforms in your niche.
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'stretch' }}>
                {/* Left Column - Input Sidebar */}
                <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column' }}>
                    <div className="depth-card" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'var(--accent-gradient)' }} />
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                            <Zap size={20} color="var(--accent-primary)" fill="var(--accent-primary)" style={{ opacity: 0.8 }} />
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Discovery Engine</h2>
                        </div>

                        <form onSubmit={handleDiscover} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', flex: 1 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                                    <Target size={16} color="var(--accent-primary)" />
                                    <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>TARGET KEYWORD / TOPIC</span>
                                </div>
                                <input
                                    type="text"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    placeholder="e.g. ai automation tools"
                                    required
                                    style={{
                                        width: '100%',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '10px',
                                        padding: '1rem',
                                        color: 'white',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                    className="focus-ring"
                                />
                            </div>

                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                                    {nicheConfigs[niche]?.icon || <Table size={16} />}
                                    <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Industry / Niche</span>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        value={niche}
                                        onChange={(e) => setNiche(e.target.value)}
                                        style={{
                                            width: '100%',
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '10px',
                                            padding: '1rem 2.5rem 1rem 1rem',
                                            color: 'white',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            appearance: 'none',
                                            cursor: 'pointer'
                                        }}
                                        className="focus-ring"
                                    >
                                        <option value="general">General / Blog</option>
                                        <option value="ecommerce">E-commerce</option>
                                        <option value="education">Education</option>
                                    </select>
                                    <ChevronDown size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                                </div>
                            </div>

                            <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
                                <button
                                    type="submit"
                                    disabled={isLoading || !keyword.trim()}
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '1.1rem', background: 'var(--accent-gradient)', border: 'none', fontSize: '1.1rem', fontWeight: '700', gap: '0.75rem', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                                        {isLoading ? (
                                            <>
                                                <RefreshCwIcon size={22} className="spin" />
                                                <span>Strategizing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Search size={22} />
                                                <span>Generate Strategy</span>
                                            </>
                                        )}
                                    </div>
                                </button>
                            </div>
                        </form>

                        {error && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#ef4444', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Info size={18} /> {error}
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Right Column - Strategy Results */}
                <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column' }}>
                    <AnimatePresence mode="wait">
                        {prompts.length === 0 ? (
                            <motion.div 
                                key="empty"
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }}
                                className="depth-card glow-static" 
                                style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    padding: '4rem 2rem', 
                                    textAlign: 'center', 
                                    height: '100%', 
                                    minHeight: '100%' 
                                }}
                            >
                                <div style={{ 
                                    width: '80px', 
                                    height: '80px', 
                                    borderRadius: '24px', 
                                    background: 'rgba(96, 165, 250, 0.08)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    marginBottom: '2rem', 
                                    border: '1px solid rgba(96, 165, 250, 0.2)',
                                    boxShadow: 'var(--elevation-med)'
                                }}>
                                    <BookOpen size={32} color="var(--accent-primary)" style={{ filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.5))' }} />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Ready for Discovery</h3>
                                <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', margin: '0 auto', fontSize: '1.05rem', lineHeight: '1.6' }}>
                                    Enter a topic and industry niche to uncover the exact queries and informational gaps users are exploring on AI search platforms.
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="results"
                                initial={{ opacity: 0, y: 20 }} 
                                animate={{ opacity: 1, y: 0 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                                        <BarChart2 size={24} color="#10b981" />
                                        Inbound Strategy Opportunities ({prompts.length})
                                    </h2>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {prompts.map((item, index) => {
                                        const volStyle = getVolumeColor(item.search_volume_estimate);

                                        return (
                                            <motion.div 
                                                key={index}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="depth-card" 
                                                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
                                                    <div style={{ flex: 1, minWidth: '300px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                                            <div style={{ width: '8px', height: '8px', background: 'var(--accent-primary)', borderRadius: '50%' }} />
                                                            <span style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Target Query</span>
                                                        </div>
                                                        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', flex: 1, color: 'white', margin: 0, letterSpacing: '-0.02em', lineHeight: '1.4' }}>
                                                            "{item.prompt}"
                                                        </h3>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                        <div style={{
                                                            padding: '0.5rem 1rem',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '800',
                                                            borderRadius: '8px',
                                                            background: volStyle.bg,
                                                            color: volStyle.color,
                                                            border: volStyle.border,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.4rem'
                                                        }}>
                                                            <TrendingUp size={14} /> VOL: {item.search_volume_estimate?.toUpperCase() || 'UNKNOWN'}
                                                        </div>
                                                        <div style={{
                                                            padding: '0.5rem 1rem',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '800',
                                                            borderRadius: '8px',
                                                            background: 'rgba(59, 130, 246, 0.1)',
                                                            color: 'var(--accent-primary)',
                                                            border: '1px solid rgba(59, 130, 246, 0.2)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.4rem'
                                                        }}>
                                                            <Target size={14} /> {item.intent?.toUpperCase()}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                        <AlertTriangle size={14} color="var(--accent-secondary)" />
                                                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-secondary)', textTransform: 'uppercase' }}>Content Gap Challenge</span>
                                                    </div>
                                                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6', fontStyle: 'italic' }}>
                                                        {item.content_gap}
                                                    </p>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                                                    <button 
                                                        onClick={() => handleWriteContent(item.prompt, niche)}
                                                        className="btn btn-secondary" 
                                                        style={{ fontSize: '0.9rem', fontWeight: '700', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}
                                                    >
                                                        Construct Content Pipeline <ArrowRight size={18} />
                                                    </button>
                                                </div>
                                                
                                                <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.02 }}>
                                                    <Globe size={100} />
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

        </div>
    );
}
