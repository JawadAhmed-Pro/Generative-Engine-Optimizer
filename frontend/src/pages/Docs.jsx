import React, { useState, useEffect } from 'react'
import { Book, Zap, FileText, BarChart2, Sparkles, CheckCircle2, ArrowRight, Home, MousePointer2, Clipboard, Play, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from '../components/landing/Navbar'

const sections = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: <Home size={20} />,
        accentColor: 'var(--accent-primary)',
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7' }}>
                    Welcome to the Generative Engine Optimizer (GEO). Follow this guide to master the flow of optimizing your content for the AI-first search era.
                </p>
                
                <div style={{ 
                    background: 'rgba(59, 130, 246, 0.05)', 
                    border: '1px solid var(--card-border)', 
                    borderRadius: 'var(--radius-lg)', 
                    padding: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'var(--accent-gradient)' }}></div>
                    <h4 style={{ color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Zap size={18} style={{ color: 'var(--accent-primary)' }} /> Essential Flow
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>1. Analyze</strong> your current visibility → <strong style={{ color: 'var(--text-primary)' }}>2. Optimize</strong> with Grounding → <strong style={{ color: 'var(--text-primary)' }}>3. Verify</strong> with the Simulator.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>The 4-Step Method</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {[
                            { step: '1', title: 'Navigate', desc: 'Select a tool from the sidebar.' },
                            { step: '2', title: 'Input Data', desc: 'Provide a URL or raw content.' },
                            { step: '3', title: 'Run Action', desc: 'Click Run to begin processing.' },
                            { step: '4', title: 'Elaborate', desc: 'Interpret scores and citations.' }
                        ].map((s) => (
                            <div key={s.step} style={{ 
                                padding: '1.25rem', 
                                background: 'var(--bg-tertiary)', 
                                border: '1px solid var(--card-border)', 
                                borderRadius: 'var(--radius-md)',
                                transition: 'all 0.3s ease'
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
        accentColor: 'var(--accent-primary)',
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Optimization Guide</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.6rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: 'var(--accent-primary)', border: '1px solid rgba(59, 130, 246, 0.2)' }}><MousePointer2 size={18}/></div>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>1. Navigate</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Click <strong style={{ color: 'var(--text-primary)' }}>"Content Optimization"</strong> on the dashboard sidebar.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.6rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: 'var(--accent-primary)', border: '1px solid rgba(59, 130, 246, 0.2)' }}><Clipboard size={18}/></div>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>2. Input URL or Text</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Paste your article content or enter the URL you want to rewrite.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.6rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: 'var(--accent-primary)', border: '1px solid rgba(59, 130, 246, 0.2)' }}><Play size={18}/></div>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>3. Click Run Analysis</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Choose <strong style={{ color: 'var(--text-primary)' }}>"Deep Optimization"</strong> to enable Jina-powered grounding for maximum factual density.</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ 
                        borderRadius: 'var(--radius-lg)', 
                        overflow: 'hidden', 
                        border: '1px solid var(--card-border)', 
                        background: 'var(--bg-primary)',
                        marginBottom: '2.5rem',
                        boxShadow: 'var(--elevation-med)'
                    }}>
                        <img 
                            src="/docs/rewrite content paste.png" 
                            alt="Rewriting Content Paste" 
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                    </div>

                    <div style={{ 
                        borderRadius: 'var(--radius-lg)', 
                        overflow: 'hidden', 
                        border: '1px solid var(--card-border)', 
                        background: 'var(--bg-primary)',
                        marginBottom: '2.5rem',
                        boxShadow: 'var(--elevation-med)'
                    }}>
                        <img 
                            src="/docs/Rewrite content  result.png" 
                            alt="Optimization Result" 
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                    </div>

                    <div style={{ 
                        background: 'var(--bg-tertiary)', 
                        border: '1px solid var(--card-border)', 
                        borderRadius: 'var(--radius-lg)', 
                        padding: '1.75rem' 
                    }}>
                        <h4 style={{ color: 'var(--text-primary)', fontWeight: '700', marginBottom: '1rem' }}>How to Elaborate the Results:</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            <li style={{ display: 'flex', gap: '0.75rem' }}>
                                <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)', shrink: 0 }} />
                                <span><strong style={{ color: 'var(--text-primary)' }}>Scientific Audit:</strong> Check the "Grounding Gap" to see what facts were missing.</span>
                            </li>
                            <li style={{ display: 'flex', gap: '0.75rem' }}>
                                <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)', shrink: 0 }} />
                                <span><strong style={{ color: 'var(--text-primary)' }}>Citation Index:</strong> Look for the generated trust signals AI engines crave.</span>
                            </li>
                            <li style={{ display: 'flex', gap: '0.75rem' }}>
                                <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)', shrink: 0 }} />
                                <span><strong style={{ color: 'var(--text-primary)' }}>FAQ Density:</strong> Ensure the generated FAQs cover common user intent to rank in AI answer boxes.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'ai-simulator',
        title: 'AI Simulator',
        icon: <Zap size={20} />,
        accentColor: 'var(--accent-primary)',
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Verification Flow</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.6rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: 'var(--accent-primary)', border: '1px solid rgba(59, 130, 246, 0.2)' }}><MousePointer2 size={18}/></div>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>1. Navigate</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Go to <strong style={{ color: 'var(--text-primary)' }}>"AI Simulator"</strong> from the sidebar.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.6rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: 'var(--accent-primary)', border: '1px solid rgba(59, 130, 246, 0.2)' }}><Clipboard size={18}/></div>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>2. Input Content & Query</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Paste your content and the specific query you want to test against.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.6rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: 'var(--accent-primary)', border: '1px solid rgba(59, 130, 246, 0.2)' }}><Play size={18}/></div>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>3. Click Run Simulation</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Wait for the LLM to process and determine your citation probability.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ 
                        borderRadius: 'var(--radius-lg)', 
                        overflow: 'hidden', 
                        border: '1px solid var(--card-border)', 
                        background: 'var(--bg-primary)',
                        marginBottom: '2.5rem',
                        boxShadow: 'var(--elevation-med)'
                    }}>
                        <img 
                            src="/docs/ai simulartor input.png" 
                            alt="AI Simulator Input" 
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                    </div>

                    <div style={{ 
                        borderRadius: 'var(--radius-lg)', 
                        overflow: 'hidden', 
                        border: '1px solid var(--card-border)', 
                        background: 'var(--bg-primary)',
                        marginBottom: '2.5rem',
                        boxShadow: 'var(--elevation-med)'
                    }}>
                        <img 
                            src="/docs/ai simulator result.png" 
                            alt="AI Simulator Result" 
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                    </div>

                    <div style={{ 
                        background: 'var(--bg-tertiary)', 
                        border: '1px solid var(--card-border)', 
                        borderRadius: 'var(--radius-lg)', 
                        padding: '1.75rem' 
                    }}>
                        <h4 style={{ color: 'var(--text-primary)', fontWeight: '700', marginBottom: '1rem' }}>How to Elaborate the Results:</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            <li style={{ display: 'flex', gap: '0.75rem' }}>
                                <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)', shrink: 0 }} />
                                <span><strong style={{ color: 'var(--text-primary)' }}>Citation Probability:</strong> Anything above <strong style={{ color: 'var(--accent-primary)' }}>80%</strong> means your content is highly optimized.</span>
                            </li>
                            <li style={{ display: 'flex', gap: '0.75rem' }}>
                                <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)', shrink: 0 }} />
                                <span><strong style={{ color: 'var(--text-primary)' }}>Semantic Alignment:</strong> If the score is low, re-optimize your content with more specific "Entities."</span>
                            </li>
                            <li style={{ display: 'flex', gap: '0.75rem' }}>
                                <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)', shrink: 0 }} />
                                <span><strong style={{ color: 'var(--text-primary)' }}>Direct Response Test:</strong> The result simulates if a user would be satisfied by the AI using your content.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'visibility',
        title: 'Visibility Analysis',
        icon: <BarChart2 size={20} />,
        accentColor: 'var(--accent-primary)',
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Audit Flow</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.6rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: 'var(--accent-primary)', border: '1px solid rgba(59, 130, 246, 0.2)' }}><MousePointer2 size={18}/></div>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>1. Navigate</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select <strong style={{ color: 'var(--text-primary)' }}>"Visibility Analysis"</strong> from the sidebar.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.6rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: 'var(--accent-primary)', border: '1px solid rgba(59, 130, 246, 0.2)' }}><Search size={18}/></div>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>2. Input URL</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Paste the full URL of the domain or article you want to audit.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.6rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: 'var(--accent-primary)', border: '1px solid rgba(59, 130, 246, 0.2)' }}><Play size={18}/></div>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>3. Click Run Analysis</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Wait for the global crawl to identify your AI citations.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ 
                        borderRadius: 'var(--radius-lg)', 
                        overflow: 'hidden', 
                        border: '1px solid var(--card-border)', 
                        background: 'var(--bg-primary)',
                        marginBottom: '2.5rem',
                        boxShadow: 'var(--elevation-med)'
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
                        border: '1px solid var(--card-border)', 
                        background: 'var(--bg-primary)',
                        marginBottom: '2.5rem',
                        boxShadow: 'var(--elevation-med)'
                    }}>
                        <img 
                            src="/docs/visibility analysis results.png" 
                            alt="Visibility Results" 
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                    </div>

                    <div style={{ 
                        background: 'var(--bg-tertiary)', 
                        border: '1px solid var(--card-border)', 
                        borderRadius: 'var(--radius-lg)', 
                        padding: '1.75rem' 
                    }}>
                        <h4 style={{ color: 'var(--text-primary)', fontWeight: '700', marginBottom: '1rem' }}>How to Elaborate the Results:</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            <li style={{ display: 'flex', gap: '0.75rem' }}>
                                <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)', shrink: 0 }} />
                                <span><strong style={{ color: 'var(--text-primary)' }}>Brand Citation Chart:</strong> See which specific AI engines (Perplexity, ChatGPT) are already using your content.</span>
                            </li>
                            <li style={{ display: 'flex', gap: '0.75rem' }}>
                                <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)', shrink: 0 }} />
                                <span><strong style={{ color: 'var(--text-primary)' }}>Share of Voice:</strong> Understand how much of the "AI Conversation" you own compared to competitors.</span>
                            </li>
                            <li style={{ display: 'flex', gap: '0.75rem' }}>
                                <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)', shrink: 0 }} />
                                <span><strong style={{ color: 'var(--text-primary)' }}>Blind Spots:</strong> Identify keywords where you are invisible to AI.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'strategy',
        title: 'Content Strategy',
        icon: <Sparkles size={20} />,
        accentColor: 'var(--accent-primary)',
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Strategy Flow</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.6rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: 'var(--accent-primary)', border: '1px solid rgba(59, 130, 246, 0.2)' }}><MousePointer2 size={18}/></div>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>1. Navigate</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Click <strong style={{ color: 'var(--text-primary)' }}>"Content Strategy"</strong> in the sidebar.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.6rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: 'var(--accent-primary)', border: '1px solid rgba(59, 130, 246, 0.2)' }}><Search size={18}/></div>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>2. Input Keyword</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Enter the main topic you want to dominate (e.g., 'SaaS SEO').</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.6rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: 'var(--accent-primary)', border: '1px solid rgba(59, 130, 246, 0.2)' }}><Play size={18}/></div>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>3. Click Generate Strategy</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Wait for the engine to map out your cluster of authority.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ 
                        borderRadius: 'var(--radius-lg)', 
                        overflow: 'hidden', 
                        border: '1px solid var(--card-border)', 
                        background: 'var(--bg-primary)',
                        marginBottom: '2.5rem',
                        boxShadow: 'var(--elevation-med)'
                    }}>
                        <img 
                            src="/docs/content startegy input with result.png" 
                            alt="Content Strategy Result" 
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                    </div>

                    <div style={{ 
                        background: 'var(--bg-tertiary)', 
                        border: '1px solid var(--card-border)', 
                        borderRadius: 'var(--radius-lg)', 
                        padding: '1.75rem' 
                    }}>
                        <h4 style={{ color: 'var(--text-primary)', fontWeight: '700', marginBottom: '1rem' }}>How to Elaborate the Results:</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            <li style={{ display: 'flex', gap: '0.75rem' }}>
                                <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)', shrink: 0 }} />
                                <span><strong style={{ color: 'var(--text-primary)' }}>Authority Cluster:</strong> Each article in the list is a "building block" for your brand trust.</span>
                            </li>
                            <li style={{ display: 'flex', gap: '0.75rem' }}>
                                <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)', shrink: 0 }} />
                                <span><strong style={{ color: 'var(--text-primary)' }}>Topical Map:</strong> Cover all these articles to ensure AI engines see you as the #1 source.</span>
                            </li>
                            <li style={{ display: 'flex', gap: '0.75rem' }}>
                                <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)', shrink: 0 }} />
                                <span><strong style={{ color: 'var(--text-primary)' }}>Intent Coverage:</strong> These titles are generated to match common AI search intents.</span>
                            </li>
                        </ul>
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
                    <div style={{ position: 'sticky', top: '8rem' }}>
                        <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
                            <h2 style={{ 
                                fontSize: '0.75rem', 
                                fontWeight: '900', 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.2em', 
                                color: 'var(--text-tertiary)' 
                            }}>
                                User Manual
                            </h2>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    style={{ 
                                        width: '100%', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.75rem', 
                                        padding: '0.9rem 1.25rem', 
                                        borderRadius: 'var(--radius-md)', 
                                        border: activeSection === section.id ? '1.5px solid rgba(59, 130, 246, 0.5)' : '1px solid transparent',
                                        background: activeSection === section.id ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                                        color: activeSection === section.id ? '#93C5FD' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                                        fontSize: '0.9rem',
                                        fontWeight: activeSection === section.id ? '700' : '500',
                                        boxShadow: activeSection === section.id ? '0 0 20px rgba(59, 130, 246, 0.2)' : 'none'
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
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            style={{ 
                                background: 'var(--bg-secondary)', 
                                border: '1px solid var(--card-border)', 
                                borderTopColor: 'rgba(255, 255, 255, 0.12)',
                                borderRadius: 'var(--radius-lg)', 
                                padding: '3rem',
                                boxShadow: 'var(--elevation-high)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Accent Glow Header */}
                            <div style={{ 
                                position: 'absolute', 
                                top: 0, 
                                left: 0, 
                                width: '100%', 
                                height: '3px', 
                                background: 'var(--accent-gradient)',
                                opacity: 0.7
                            }}></div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '3rem' }}>
                                <div style={{ 
                                    width: '3.75rem', 
                                    height: '3.75rem', 
                                    borderRadius: '12px', 
                                    background: 'rgba(59, 130, 246, 0.12)', 
                                    border: '1.5px solid rgba(59, 130, 246, 0.3)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    color: 'var(--accent-primary)',
                                    boxShadow: '0 0 25px rgba(59, 130, 246, 0.2)'
                                }}>
                                    {sections.find(s => s.id === activeSection)?.icon}
                                </div>
                                <h1 style={{ 
                                    fontSize: '2.75rem', 
                                    fontWeight: '800', 
                                    color: 'var(--text-primary)', 
                                    letterSpacing: '-0.04em',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                                }}>
                                    {sections.find(s => s.id === activeSection)?.title}
                                </h1>
                            </div>

                            <div style={{ minHeight: '400px' }}>
                                {sections.find(s => s.id === activeSection)?.content}
                            </div>

                            {/* Navigation Footer */}
                            <div style={{ 
                                marginTop: '5rem', 
                                paddingTop: '3rem', 
                                borderTop: '1px solid var(--card-border)', 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center' 
                            }}>
                                <Link to="/app" style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '0.6rem', 
                                    fontSize: '0.95rem', 
                                    color: 'var(--text-secondary)', 
                                    textDecoration: 'none',
                                    transition: 'all 0.2s ease',
                                    fontWeight: '600'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.color = 'var(--accent-primary)'
                                    e.currentTarget.style.transform = 'translateX(4px)'
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.color = 'var(--text-secondary)'
                                    e.currentTarget.style.transform = 'translateX(0)'
                                }}
                                >
                                    Back to Optimization Engine <ArrowRight size={16} />
                                </Link>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Premium Aurora Background Effects - EXACTLY matching main dashboard */}
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -1, overflow: 'hidden', background: 'var(--bg-primary)' }}>
                <div style={{ 
                    position: 'absolute', 
                    top: '-20vw', 
                    right: '-10vw', 
                    width: '80vw', 
                    height: '80vw', 
                    background: 'radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)', 
                    filter: 'blur(140px)', 
                    borderRadius: '50%',
                    opacity: 0.35
                }}></div>
                <div style={{ 
                    position: 'absolute', 
                    bottom: '-15vw', 
                    left: '-5vw', 
                    width: '70vw', 
                    height: '70vw', 
                    background: 'radial-gradient(circle, var(--accent-secondary) 0%, transparent 70%)', 
                    filter: 'blur(140px)', 
                    borderRadius: '50%',
                    opacity: 0.3
                }}></div>
            </div>
        </div>
    )
}

export default Docs
