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
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7' }}>
                    Welcome to the Generative Engine Optimizer (GEO). Follow this guide to master the flow of optimizing your content for the AI-first search era.
                </p>
                
                <div style={{ 
                    background: 'rgba(59, 130, 246, 0.1)', 
                    border: '1px solid rgba(59, 130, 246, 0.2)', 
                    borderRadius: 'var(--radius-lg)', 
                    padding: '1.5rem' 
                }}>
                    <h4 style={{ color: 'var(--accent-primary)', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Zap size={18} /> Essential Flow
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(248, 250, 252, 0.8)' }}>
                        <strong>1. Analyze</strong> your current visibility → <strong>2. Optimize</strong> with Grounding → <strong>3. Verify</strong> with the Simulator.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>The 4-Step Method</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {[
                            { step: '1', title: 'Navigate', desc: 'Select a tool from the sidebar.' },
                            { step: '2', title: 'Input Data', desc: 'Provide a URL or raw content.' },
                            { step: '3', title: 'Run Action', desc: 'Click Run to begin processing.' },
                            { step: '4', title: 'Elaborate', desc: 'Interpret scores and citations.' }
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
                    <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Optimization Guide</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: 'var(--accent-primary)' }}><MousePointer2 size={18}/></div>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>1. Navigate</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Click **"Content Optimization"** on the dashboard sidebar.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: 'var(--accent-primary)' }}><Clipboard size={18}/></div>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>2. Input URL or Text</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Paste your article content or enter the URL you want to rewrite.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: 'var(--accent-primary)' }}><Play size={18}/></div>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>3. Click Run Analysis</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Choose **"Deep Optimization"** to enable Jina-powered grounding for maximum factual density.</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ 
                        borderRadius: 'var(--radius-lg)', 
                        overflow: 'hidden', 
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        background: 'rgba(0, 0, 0, 0.3)',
                        marginBottom: '2.5rem'
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
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        background: 'rgba(0, 0, 0, 0.3)',
                        marginBottom: '2rem'
                    }}>
                        <img 
                            src="/docs/Rewrite content  result.png" 
                            alt="Optimization Result" 
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                    </div>

                    <div style={{ 
                        background: 'rgba(255, 255, 255, 0.03)', 
                        border: '1px solid rgba(255, 255, 255, 0.08)', 
                        borderRadius: 'var(--radius-lg)', 
                        padding: '1.5rem' 
                    }}>
                        <h4 style={{ color: 'var(--text-primary)', fontWeight: '700', marginBottom: '0.75rem' }}>How to Elaborate the Results:</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            <li>• <strong style={{ color: 'var(--accent-primary)' }}>Scientific Audit:</strong> Check the "Grounding Gap" to see what facts were missing.</li>
                            <li>• <strong style={{ color: 'var(--accent-primary)' }}>Citation Index:</strong> Look for the generated `[1]` markers—these are the trust signals AI engines crave.</li>
                            <li>• <strong style={{ color: 'var(--accent-primary)' }}>FAQ Density:</strong> Ensure the generated FAQs cover common user intent to rank in AI answer boxes.</li>
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
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Verification Flow</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px', color: '#A855F7' }}><MousePointer2 size={18}/></div>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>1. Navigate</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Go to **"AI Simulator"** from the sidebar.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px', color: '#A855F7' }}><Clipboard size={18}/></div>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>2. Input Content & Query</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Paste your content and the specific query you want to test against.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px', color: '#A855F7' }}><Play size={18}/></div>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>3. Click Run Simulation</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Wait for the LLM to process and determine your citation probability.</p>
                            </div>
                        </div>
                    </div>
                    
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
                        borderRadius: 'var(--radius-lg)', 
                        overflow: 'hidden', 
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        background: 'rgba(0, 0, 0, 0.3)',
                        marginBottom: '2rem'
                    }}>
                        <img 
                            src="/docs/ai simulator result.png" 
                            alt="AI Simulator Result" 
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                    </div>

                    <div style={{ 
                        background: 'rgba(255, 255, 255, 0.03)', 
                        border: '1px solid rgba(255, 255, 255, 0.08)', 
                        borderRadius: 'var(--radius-lg)', 
                        padding: '1.5rem' 
                    }}>
                        <h4 style={{ color: 'var(--text-primary)', fontWeight: '700', marginBottom: '0.75rem' }}>How to Elaborate the Results:</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            <li>• <strong style={{ color: '#A855F7' }}>Citation Probability:</strong> Anything above **80%** means your content is highly optimized.</li>
                            <li>• <strong style={{ color: '#A855F7' }}>Semantic Alignment:</strong> If the score is low, re-optimize your content with more specific "Entities."</li>
                            <li>• <strong style={{ color: '#A855F7' }}>Direct Response Test:</strong> The result simulates if a user would be satisfied by the AI using your content.</li>
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
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Audit Flow</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: '#10B981' }}><MousePointer2 size={18}/></div>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>1. Navigate</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select **"Visibility Analysis"** from the sidebar.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: '#10B981' }}><Search size={18}/></div>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>2. Input URL</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Paste the full URL of the domain or article you want to audit.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: '#10B981' }}><Play size={18}/></div>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>3. Click Run Analysis</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Wait for the global crawl to identify your AI citations.</p>
                            </div>
                        </div>
                    </div>
                    
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
                        background: 'rgba(0, 0, 0, 0.3)',
                        marginBottom: '2rem'
                    }}>
                        <img 
                            src="/docs/visibility analysis results.png" 
                            alt="Visibility Results" 
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                    </div>

                    <div style={{ 
                        background: 'rgba(255, 255, 255, 0.03)', 
                        border: '1px solid rgba(255, 255, 255, 0.08)', 
                        borderRadius: 'var(--radius-lg)', 
                        padding: '1.5rem' 
                    }}>
                        <h4 style={{ color: 'var(--text-primary)', fontWeight: '700', marginBottom: '0.75rem' }}>How to Elaborate the Results:</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            <li>• <strong style={{ color: '#10B981' }}>Brand Citation Chart:</strong> See which specific AI engines (Perplexity, ChatGPT) are already using your content.</li>
                            <li>• <strong style={{ color: '#10B981' }}>Share of Voice:</strong> Understand how much of the "AI Conversation" you own compared to competitors.</li>
                            <li>• <strong style={{ color: '#10B981' }}>Blind Spots:</strong> Identify keywords where you are invisible to AI.</li>
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
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Strategy Flow</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', color: '#F59E0B' }}><MousePointer2 size={18}/></div>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>1. Navigate</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Click **"Content Strategy"** in the sidebar.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', color: '#F59E0B' }}><Search size={18}/></div>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>2. Input Keyword</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Enter the main topic you want to dominate (e.g., 'SaaS SEO').</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', color: '#F59E0B' }}><Play size={18}/></div>
                            <div>
                                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>3. Click Generate Strategy</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Wait for the engine to map out your cluster of authority.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ 
                        borderRadius: 'var(--radius-lg)', 
                        overflow: 'hidden', 
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        background: 'rgba(0, 0, 0, 0.3)',
                        marginBottom: '2rem'
                    }}>
                        <img 
                            src="/docs/content startegy input with result.png" 
                            alt="Content Strategy Result" 
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                    </div>

                    <div style={{ 
                        background: 'rgba(255, 255, 255, 0.03)', 
                        border: '1px solid rgba(255, 255, 255, 0.08)', 
                        borderRadius: 'var(--radius-lg)', 
                        padding: '1.5rem' 
                    }}>
                        <h4 style={{ color: 'var(--text-primary)', fontWeight: '700', marginBottom: '0.75rem' }}>How to Elaborate the Results:</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            <li>• <strong style={{ color: '#F59E0B' }}>Authority Cluster:</strong> Each article in the list is a "building block" for your brand trust.</li>
                            <li>• <strong style={{ color: '#F59E0B' }}>Topical Map:</strong> Cover all these articles to ensure AI engines see you as the #1 source.</li>
                            <li>• <strong style={{ color: '#F59E0B' }}>Intent Coverage:</strong> These titles are generated to match common AI search intents.</li>
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
