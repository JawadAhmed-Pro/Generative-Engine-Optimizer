import { useState } from 'react';
import { Sparkles, Search, BookOpen, BarChart2 } from 'lucide-react';
import axios from 'axios';

export default function ContentStrategy() {
    const [keyword, setKeyword] = useState('');
    const [niche, setNiche] = useState('general');
    const [prompts, setPrompts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDiscover = async (e) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post('/api/discover-prompts', { keyword, niche });
            setPrompts(response.data.prompts || []);
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to discover prompts');
        } finally {
            setIsLoading(false);
        }
    };

    const getVolumeColor = (volume) => {
        switch (volume?.toLowerCase()) {
            case 'high': return { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)' };
            case 'medium': return { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', border: '1px solid rgba(245, 158, 11, 0.2)' };
            case 'low': return { bg: 'rgba(148, 163, 184, 0.1)', color: 'var(--text-secondary)', border: '1px solid rgba(148, 163, 184, 0.2)' };
            default: return { bg: 'rgba(148, 163, 184, 0.1)', color: 'var(--text-secondary)', border: '1px solid rgba(148, 163, 184, 0.2)' };
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <header>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <Sparkles size={28} color="var(--accent-secondary)" />
                    Content Strategy Discovery
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Discover what users are asking AI in your niche.</p>
            </header>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                {/* Left Column - Input */}
                <div className="glass-card" style={{ flex: '1 1 300px', height: 'fit-content' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Discovery Engine</h2>
                    <form onSubmit={handleDiscover} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Target Keyword / Topic
                            </label>
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="e.g., ai automation tools"
                                required
                                style={{
                                    width: '100%',
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    padding: '0.75rem 1rem',
                                    color: 'white',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                Industry / Niche
                            </label>
                            <select
                                value={niche}
                                onChange={(e) => setNiche(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    padding: '0.75rem 1rem',
                                    color: 'white',
                                    fontSize: '0.95rem'
                                }}
                            >
                                <option value="general">General</option>
                                <option value="ecommerce">E-Commerce</option>
                                <option value="saas">SaaS / Software</option>
                                <option value="finance">Finance</option>
                                <option value="health">Healthcare</option>
                                <option value="education">Education</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '0.5rem', opacity: isLoading ? 0.7 : 1 }}
                        >
                            {isLoading ? 'Discovering...' : (
                                <>
                                    <Search size={18} /> Generate Strategy
                                </>
                            )}
                        </button>
                    </form>

                    {error && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: 'var(--error)', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}
                </div>

                {/* Right Column - Results */}
                <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column' }}>
                    {prompts.length === 0 ? (
                        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center', height: '100%' }}>
                            <BookOpen size={48} color="var(--text-tertiary)" style={{ marginBottom: '1rem' }} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '0.5rem' }}>No Prompts Discovered Yet</h3>
                            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
                                Enter a target keyword and your niche to uncover what questions real users are asking AI platforms.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <BarChart2 size={24} color="var(--success)" />
                                Recommended Content Strategy ({prompts.length} Opportunities)
                            </h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {prompts.map((item, index) => {
                                    const volStyle = getVolumeColor(item.search_volume_estimate);

                                    return (
                                        <div key={index} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: '500', flex: 1, minWidth: '200px' }}>
                                                    "{item.prompt}"
                                                </h3>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        borderRadius: '999px',
                                                        background: volStyle.bg,
                                                        color: volStyle.color,
                                                        border: volStyle.border
                                                    }}>
                                                        Vol: {item.search_volume_estimate?.toUpperCase() || 'UNKNOWN'}
                                                    </span>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        borderRadius: '999px',
                                                        background: 'rgba(59, 130, 246, 0.1)',
                                                        color: 'var(--accent-primary)',
                                                        border: '1px solid rgba(59, 130, 246, 0.2)'
                                                    }}>
                                                        {item.intent?.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--accent-secondary)', marginBottom: '0.5rem' }}>
                                                    Content Gap Challenge:
                                                </p>
                                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                    {item.content_gap}
                                                </p>
                                            </div>

                                            <div>
                                                <button className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                                                    Write Content
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
