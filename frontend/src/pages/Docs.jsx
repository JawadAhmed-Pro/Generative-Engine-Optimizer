import React, { useState, useEffect } from 'react'
import { Book, Zap, FileText, BarChart2, Sparkles, CheckCircle2, ArrowRight, Home } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from '../components/landing/Navbar'

const sections = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: <Home size={20} />,
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7' }}>
                    Welcome to the Generative Engine Optimizer (GEO). This tool is designed to help your content get noticed, cited, and recommended by AI engines like ChatGPT, Gemini, and Perplexity.
                </p>
                
                <div style={{ 
                    background: 'rgba(59, 130, 246, 0.1)', 
                    border: '1px solid rgba(59, 130, 246, 0.2)', 
                    borderRadius: 'var(--radius-lg)', 
                    padding: '1.5rem' 
                }}>
                    <h4 style={{ color: 'var(--accent-primary)', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Zap size={18} /> Pro Tip
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(248, 250, 252, 0.8)' }}>
                        For the best results, always use the "Deep Optimization" mode when working on educational or pillar blog content. This enables the Jina Search grounding for maximum factual density.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>The Workflow</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {[
                            { step: '1', title: 'Research', desc: 'Identify semantic gaps in your niche.' },
                            { step: '2', title: 'Optimize', desc: 'Rewrite content with Jina-powered grounding.' },
                            { step: '3', title: 'Verify', desc: 'Test perception using the AI Simulator.' },
                            { step: '4', title: 'Publish', desc: 'Watch your AI citations grow.' }
                        ].map((s) => (
                            <div key={s.step} style={{ 
                                padding: '1.25rem', 
                                background: 'rgba(255, 255, 255, 0.03)', 
                                border: '1px solid rgba(255, 255, 255, 0.08)', 
                                borderRadius: 'var(--radius-md)' 
                            }}>
                                <div style={{ color: 'var(--accent-primary)', fontWeight: '900', fontSize: '1.25rem', marginBottom: '0.25rem' }}>{s.step}</div>
                                <div style={{ color: 'var(--text-primary)', fontWeight: '700', marginBottom: '0.25rem' }}>{s.title}</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{s.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'optimization',
        title: 'Content Optimization',
        icon: <FileText size={20} />,
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1rem' }}>Rewriting for AI-First Search</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Our optimization engine doesn't just "fix" grammar. It injects **Semantic Bridges** and **Grounded Facts** that AI scrapers look for when building their knowledge base.
                    </p>
                    
                    <div style={{ 
                        borderRadius: 'var(--radius-lg)', 
                        overflow: 'hidden', 
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        background: 'rgba(0, 0, 0, 0.3)',
                        marginBottom: '2rem'
                    }}>
                        <img 
                            src="/docs/rewrite content paste.png" 
                            alt="Rewriting Content" 
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                        <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-tertiary)', background: 'rgba(255, 255, 255, 0.02)', fontStyle: 'italic' }}>
                            Paste your existing content or a target URL to begin the audit.
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>How it Works:</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {[
                                { title: 'Jina Search Grounding', text: 'The tool searches the web for real-world stats to back your claims.' },
                                { title: 'Entity Enrichment', text: 'We inject high-authority entities that link your content to the broader knowledge graph.' },
                                { title: 'FAQ Injection', text: 'Every rewrite includes a schema-ready FAQ section to capture "Answer Boxes."' }
                            ].map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                    <CheckCircle2 style={{ color: 'var(--accent-primary)', marginTop: '0.25rem' }} size={18} />
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                        <strong style={{ color: 'var(--text-primary)' }}>{item.title}:</strong> {item.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ 
                        marginTop: '2.5rem',
                        borderRadius: 'var(--radius-lg)', 
                        overflow: 'hidden', 
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        background: 'rgba(0, 0, 0, 0.3)'
                    }}>
                        <img 
                            src="/docs/Rewrite content  result.png" 
                            alt="Optimization Result" 
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                        <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-tertiary)', background: 'rgba(255, 255, 255, 0.02)', fontStyle: 'italic' }}>
                            The final result features a punchy H1, high fact density, and structured citations.
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'ai-simulator',
        title: 'AI Simulator',
        icon: <Zap size={20} />,
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1rem' }}>See Your Content Through AI Eyes</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Before you publish, use the AI Simulator to see if an LLM (like GPT-4) would actually cite your content for a specific query.
                    </p>
                    
                    <div style={{ 
                        borderRadius: 'var(--radius-lg)', 
                        overflow: 'hidden', 
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        background: 'rgba(0, 0, 0, 0.3)',
                        marginBottom: '1.5rem'
                    }}>
                        <img 
                            src="/docs/ai simulartor input.png" 
                            alt="AI Simulator Input" 
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                    </div>

                    <div style={{ 
                        background: 'rgba(168, 85, 247, 0.1)', 
                        border: '1px solid rgba(168, 85, 247, 0.2)', 
                        borderRadius: 'var(--radius-lg)', 
                        padding: '1.5rem',
                        marginBottom: '2rem'
                    }}>
                        <p style={{ fontSize: '0.9rem', color: 'rgba(248, 250, 252, 0.8)' }}>
                            The simulator analyzes "Citation Probability." If your content is too vague or lacks unique data, the AI is less likely to use it as a source.
                        </p>
                    </div>

                    <div style={{ 
                        borderRadius: 'var(--radius-lg)', 
                        overflow: 'hidden', 
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        background: 'rgba(0, 0, 0, 0.3)'
                    }}>
                        <img 
                            src="/docs/ai simulator result.png" 
                            alt="AI Simulator Result" 
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                        <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-tertiary)', background: 'rgba(255, 255, 255, 0.02)', fontStyle: 'italic' }}>
                            A high probability score means your content is "Cite-Ready."
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'visibility',
        title: 'Visibility Analysis',
        icon: <BarChart2 size={20} />,
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1rem' }}>Track Your Citations</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Paste a URL to see how many AI engines are currently referencing your brand or content.
                    </p>
                    
                    <div style={{ 
                        borderRadius: 'var(--radius-lg)', 
                        overflow: 'hidden', 
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        background: 'rgba(0, 0, 0, 0.3)',
                        marginBottom: '1.5rem'
                    }}>
                        <img 
                            src="/docs/vsibilty analysis url input.png" 
                            alt="Visibility Input" 
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                    </div>

                    <div style={{ 
                        borderRadius: 'var(--radius-lg)', 
                        overflow: 'hidden', 
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        background: 'rgba(0, 0, 0, 0.3)'
                    }}>
                        <img 
                            src="/docs/visibility analysis results.png" 
                            alt="Visibility Results" 
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                        <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-tertiary)', background: 'rgba(255, 255, 255, 0.02)', fontStyle: 'italic' }}>
                            Understand where you stand in the Generative Search ecosystem.
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'strategy',
        title: 'Content Strategy',
        icon: <Sparkles size={20} />,
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1rem' }}>Build Topical Authority</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Enter a keyword, and we'll map out a cluster of 10-15 related articles you need to write to own that niche.
                    </p>
                    
                    <div style={{ 
                        borderRadius: 'var(--radius-lg)', 
                        overflow: 'hidden', 
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        background: 'rgba(0, 0, 0, 0.3)'
                    }}>
                        <img 
                            src="/docs/content startegy input with result.png" 
                            alt="Content Strategy" 
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                        <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-tertiary)', background: 'rgba(255, 255, 255, 0.02)', fontStyle: 'italic' }}>
                            Complete topical maps to dominate AI engine responses.
                        </div>
                    </div>
                </div>
            </div>
        )
    }
]

function Docs() {
    const [activeSection, setActiveSection] = useState('getting-started')

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [activeSection])

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'var(--bg-primary)', 
            color: 'var(--text-primary)',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
            <Navbar />
            
            <div style={{ 
                maxWidth: '1400px', 
                margin: '0 auto', 
                padding: '8rem 1.5rem 4rem 1.5rem',
                display: 'flex',
                flexDirection: 'row',
                gap: '3rem',
                flexWrap: 'wrap'
            }}>
                {/* Sidebar Navigation */}
                <aside style={{ 
                    width: '280px', 
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                }}>
                    <div style={{ sticky: 'top', top: '8rem' }}>
                        <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
                            <h2 style={{ 
                                fontSize: '0.75rem', 
                                fontWeight: '900', 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.2em', 
                                color: 'var(--text-tertiary)' 
                            }}>
                                Documentation
                            </h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    style={{ 
                                        width: '100%', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.75rem', 
                                        padding: '0.85rem 1rem', 
                                        borderRadius: 'var(--radius-md)', 
                                        border: activeSection === section.id ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                                        background: activeSection === section.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                        color: activeSection === section.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.2s ease',
                                        fontSize: '0.9rem',
                                        fontWeight: activeSection === section.id ? '600' : '500'
                                    }}
                                    onMouseOver={(e) => {
                                        if (activeSection !== section.id) {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                                            e.currentTarget.style.color = 'var(--text-primary)'
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (activeSection !== section.id) {
                                            e.currentTarget.style.background = 'transparent'
                                            e.currentTarget.style.color = 'var(--text-secondary)'
                                        }
                                    }}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center' }}>{section.icon}</span>
                                    <span>{section.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main style={{ flex: 1, minWidth: '320px' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            style={{ 
                                background: 'var(--bg-secondary)', 
                                border: '1px solid var(--card-border)', 
                                borderRadius: 'var(--radius-lg)', 
                                padding: '2.5rem',
                                boxShadow: 'var(--elevation-med)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Accent Glow */}
                            <div style={{ 
                                position: 'absolute', 
                                top: 0, 
                                left: 0, 
                                width: '100%', 
                                height: '2px', 
                                background: 'var(--accent-gradient)',
                                opacity: 0.5
                            }}></div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                                <div style={{ 
                                    width: '3.5rem', 
                                    height: '3.5rem', 
                                    borderRadius: '1rem', 
                                    background: 'rgba(59, 130, 246, 0.1)', 
                                    border: '1px solid rgba(59, 130, 246, 0.2)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    color: 'var(--accent-primary)' 
                                }}>
                                    {sections.find(s => s.id === activeSection)?.icon}
                                </div>
                                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
                                    {sections.find(s => s.id === activeSection)?.title}
                                </h1>
                            </div>

                            <div style={{ minHeight: '400px' }}>
                                {sections.find(s => s.id === activeSection)?.content}
                            </div>

                            {/* Navigation Footer */}
                            <div style={{ 
                                marginTop: '4rem', 
                                paddingTop: '2.5rem', 
                                borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center' 
                            }}>
                                <Link to="/app" style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.5rem', 
                                    fontSize: '0.9rem', 
                                    color: 'var(--text-tertiary)', 
                                    textDecoration: 'none',
                                    transition: 'color 0.2s ease'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                                >
                                    Back to App <ArrowRight size={14} />
                                </Link>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Premium Background Effects */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -1, overflow: 'hidden' }}>
                <div style={{ 
                    position: 'absolute', 
                    top: '-10%', 
                    left: '-10%', 
                    width: '40%', 
                    height: '40%', 
                    background: 'rgba(59, 130, 246, 0.05)', 
                    filter: 'blur(120px)', 
                    borderRadius: '50%' 
                }}></div>
                <div style={{ 
                    position: 'absolute', 
                    bottom: '-10%', 
                    right: '-10%', 
                    width: '40%', 
                    height: '40%', 
                    background: 'rgba(147, 51, 234, 0.05)', 
                    filter: 'blur(120px)', 
                    borderRadius: '50%' 
                }}></div>
            </div>
        </div>
    )
}

export default Docs
