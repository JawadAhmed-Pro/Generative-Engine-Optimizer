import { ArrowRight, Play, Search, Sparkles, Zap, Bot, TrendingUp, Shield, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

function Hero() {
    return (
        <section className="section" style={{ paddingTop: '6rem', paddingBottom: '8rem', position: 'relative', overflow: 'hidden' }}>
            {/* Multiple Background Glows */}
            <div style={{
                position: 'absolute',
                top: '-30%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '800px',
                height: '800px',
                background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(0,0,0,0) 60%)',
                zIndex: 0,
                pointerEvents: 'none'
            }}></div>
            <div style={{
                position: 'absolute',
                top: '20%',
                left: '10%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(0,0,0,0) 70%)',
                zIndex: 0,
                pointerEvents: 'none'
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: '10%',
                right: '5%',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, rgba(0,0,0,0) 70%)',
                zIndex: 0,
                pointerEvents: 'none'
            }}></div>

            <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>

                {/* Badge */}
                <div className="animate-fade-in" style={{ marginBottom: '2rem' }}>
                    <span style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Sparkles size={16} color="#a78bfa" />
                        THE FUTURE OF SEO IS HERE
                    </span>
                </div>

                {/* Headline */}
                <h1 className="animate-fade-in" style={{
                    fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                    fontWeight: '800',
                    marginBottom: '1.5rem',
                    letterSpacing: '-0.03em',
                    lineHeight: '1.05'
                }}>
                    Dominate AI Search <br />
                    with <span style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>Generative Engine Optimization</span>
                </h1>

                {/* Subhead */}
                <p className="animate-fade-in" style={{
                    fontSize: '1.25rem',
                    color: 'var(--text-secondary)',
                    maxWidth: '700px',
                    margin: '0 auto 3rem',
                    lineHeight: '1.7'
                }}>
                    Optimize your content for <strong style={{ color: 'white' }}>ChatGPT</strong>, <strong style={{ color: 'white' }}>Google AI Overviews</strong>, and <strong style={{ color: 'white' }}>Perplexity</strong>.
                    Analyze visibility, rewrite for citations, and monitor how AI sees your content.
                </p>

                {/* CTAs */}
                <div className="animate-fade-in" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem', flexWrap: 'wrap' }}>
                    <Link to="/app" className="btn btn-primary" style={{
                        padding: '1rem 2.5rem',
                        fontSize: '1.1rem',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        border: 'none',
                        boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3)'
                    }}>
                        Start Free Analysis <ArrowRight size={20} />
                    </Link>
                    <button className="btn" style={{
                        padding: '1rem 2rem',
                        fontSize: '1.1rem',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <Play size={18} style={{ marginRight: '0.5rem' }} /> Watch 2-Min Demo
                    </button>
                </div>

                {/* Trust Badges */}
                <div className="animate-fade-in" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '2rem',
                    marginBottom: '5rem',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                        <Shield size={16} color="#10b981" /> No credit card required
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                        <TrendingUp size={16} color="#3b82f6" /> 10,000+ URLs analyzed
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                        <Star size={16} color="#f59e0b" /> 4.9/5 user rating
                    </div>
                </div>

                {/* AI Engines Bar */}
                <div className="animate-fade-in" style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    padding: '1.5rem 2rem',
                    maxWidth: '700px',
                    margin: '0 auto 4rem',
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.05em' }}>OPTIMIZED FOR:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontWeight: '500' }}>
                        <div style={{ width: '24px', height: '24px', background: 'linear-gradient(135deg, #4285f4, #34a853)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Search size={14} />
                        </div>
                        Google AI
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontWeight: '500' }}>
                        <div style={{ width: '24px', height: '24px', background: 'linear-gradient(135deg, #10a37f, #1a7f64)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bot size={14} />
                        </div>
                        ChatGPT
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontWeight: '500' }}>
                        <div style={{ width: '24px', height: '24px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Sparkles size={14} />
                        </div>
                        Perplexity
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontWeight: '500' }}>
                        <div style={{ width: '24px', height: '24px', background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Zap size={14} />
                        </div>
                        Gemini
                    </div>
                </div>

                {/* Dashboard Preview */}
                <div className="animate-fade-in" style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    maxWidth: '1000px',
                    margin: '0 auto',
                    boxShadow: '0 40px 80px -20px rgba(0,0,0,0.5), 0 0 1px 0 rgba(255,255,255,0.1) inset'
                }}>
                    {/* Mock Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }}></div>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }}></div>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }}></div>
                        </div>
                        <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-tertiary)',
                            background: 'rgba(255,255,255,0.05)',
                            padding: '0.25rem 1rem',
                            borderRadius: '20px'
                        }}>app.geo-optimizer.io/analysis</div>
                        <div></div>
                    </div>

                    {/* Mock Content */}
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1.5rem', textAlign: 'left' }}>
                        {/* Sidebar */}
                        <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)', paddingRight: '1rem' }}>
                            <div style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)', fontWeight: '600', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Zap size={16} /> GEO Tool
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                <div style={{ color: 'white', background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))', padding: '0.5rem 0.75rem', borderRadius: '6px', fontWeight: '500' }}>🎯 Visibility Analysis</div>
                                <div style={{ padding: '0.5rem 0.75rem' }}>✏️ Content Optimizer</div>
                                <div style={{ padding: '0.5rem 0.75rem' }}>🤖 AI Simulator</div>
                                <div style={{ padding: '0.5rem 0.75rem' }}>📁 Projects</div>
                            </div>
                        </div>

                        {/* Main Area */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Analysis Results</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>example.com/blog/ai-trends-2024</p>
                                </div>
                                <div style={{
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    fontWeight: '700'
                                }}>
                                    Score: 87/100
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>92</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>AI Visibility</div>
                                </div>
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>85</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Citation Score</div>
                                </div>
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8b5cf6' }}>88</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Semantic</div>
                                </div>
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>83</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Readability</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero
