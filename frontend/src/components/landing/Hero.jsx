import { ArrowRight, Play, Search, Sparkles, Zap, Bot, TrendingUp, Shield, Star, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function Hero() {
    return (
        <section className="section" style={{ paddingTop: '6rem', paddingBottom: '4rem', position: 'relative', background: 'transparent' }}>
            <motion.div
                className="container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}
            >
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    style={{ marginBottom: '2rem' }}
                >
                    <span style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        color: 'var(--accent-primary)',
                        padding: '0.6rem 1.25rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase'
                    }}>
                        <Sparkles size={16} />
                        The Future of SEO
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    style={{
                        fontSize: 'clamp(3.5rem, 8vw, 4rem)',
                        fontWeight: '800',
                        marginBottom: '2rem',
                        letterSpacing: '-0.04em',
                        lineHeight: '1',
                        color: 'var(--text-primary)',
                        background: 'transparent'
                    }}
                >
                    Dominate AI Search <br />
                    with <span className="text-gradient">Generative Engine Optimization</span>
                </motion.h1>

                {/* Subhead */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    style={{
                        fontSize: '1.4rem',
                        color: 'var(--text-secondary)',
                        maxWidth: '800px',
                        margin: '0 auto 4.5rem',
                        lineHeight: '1.8'
                    }}
                >
                    Stop guessing. AI-Driven SEO helps you optimize for <strong style={{ color: 'var(--text-primary)' }}>ChatGPT</strong>, <strong style={{ color: 'var(--text-primary)' }}>Google AI Overviews</strong>, and <strong style={{ color: 'var(--text-primary)' }}>Perplexity</strong> in real-time.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '4rem', flexWrap: 'wrap' }}
                >
                    <Link to="/app" className="btn btn-primary" style={{
                        padding: '1.25rem 3rem',
                        fontSize: '1.1rem',
                        background: 'var(--accent-primary)',
                        boxShadow: '0 20px 40px rgba(59, 130, 246, 0.25)',
                        border: 'none',
                    }}>
                        Start Free Analysis <ArrowRight size={22} style={{ marginLeft: '0.5rem' }} />
                    </Link>
                    <button className="btn" style={{
                        padding: '1.25rem 2.5rem',
                        fontSize: '1.1rem',
                        border: '1px solid var(--bg-tertiary)',
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(10px)',
                        color: 'var(--text-primary)',
                        transition: 'all 0.2s'
                    }} onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'; }}>
                        <Play size={20} style={{ marginRight: '0.75rem' }} /> Watch Demo
                    </button>
                </motion.div>

                {/* Dashboard Preview Wrapper */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 40 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1, duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
                    style={{ position: 'relative', perspective: '1200px' }}
                >
                    {/* The Glass Container */}
                    <motion.div
                        animate={{
                            y: [0, -10, 0],
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="depth-card"
                        style={{
                            maxWidth: '1050px',
                            margin: '0 auto',
                            padding: '1.5rem',
                            background: 'var(--bg-secondary)',
                            backdropFilter: 'blur(40px)',
                            border: '1px solid var(--bg-tertiary)',
                            borderRadius: '24px',
                            boxShadow: '0 50px 100px -20px rgba(0,0,0,0.2)',
                            textAlign: 'left',
                            overflow: 'hidden',
                            position: 'relative',
                            zIndex: 1
                        }}
                    >
                        {/* Browser Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.6rem 1.25rem',
                            borderBottom: '1px solid var(--bg-tertiary)',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '12px 12px 0 0',
                            margin: '-1.5rem -1.5rem 1.5rem'
                        }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56', opacity: 0.7 }}></div>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e', opacity: 0.7 }}></div>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f', opacity: 0.7 }}></div>
                            </div>
                            <div style={{
                                background: 'var(--bg-primary)',
                                padding: '0.35rem 1rem',
                                borderRadius: '6px',
                                fontSize: '0.65rem',
                                color: 'var(--text-tertiary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                border: '1px solid var(--bg-tertiary)'
                            }}>
                                <Shield size={10} /> secure.geointelligence.site
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} className="pulse"></div>
                                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#10B981', letterSpacing: '0.05em' }}>LIVE</span>
                            </div>
                        </div>

                        {/* Layout: Sidebar + Main Content */}
                        <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: '1.5rem' }}>
                            {/* Mini Sidebar */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.5rem',
                                paddingRight: '1rem',
                                borderRight: '1px solid var(--bg-tertiary)',
                                color: 'var(--text-tertiary)',
                                alignItems: 'center'
                            }}>
                                <div style={{ color: 'var(--accent-primary)', padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px' }}><Play size={20} /></div>
                                <TrendingUp size={20} />
                                <Bot size={20} />
                                <Shield size={20} />
                                <Star size={20} />
                                <div style={{ marginTop: 'auto', opacity: 0.5 }}><Info size={20} /></div>
                            </div>

                            {/* Main Content Area Wrapper */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {/* Mock Top Bar Detail */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>Main Stack <Info size={12} style={{ opacity: 0.3, marginLeft: '4px' }} /></div>
                                        <div style={{ padding: '0.2rem 0.6rem', background: 'var(--bg-tertiary)', borderRadius: '4px', fontSize: '0.65rem', color: 'var(--text-secondary)', border: '1px solid var(--bg-tertiary)' }}>Production v2.4</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}></div>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--accent-primary), var(--accent-secondary))' }}></div>
                                    </div>
                                </div>

                                {/* Authority Metric Card */}
                                <div className="depth-card" style={{
                                    padding: '1.25rem',
                                    background: 'var(--bg-primary)',
                                    display: 'grid',
                                    gridTemplateColumns: '1.2fr 2fr',
                                    gap: '2rem',
                                    alignItems: 'center',
                                    border: '1px solid var(--bg-tertiary)'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Authority Index</div>
                                        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>84.2<span style={{ fontSize: '1rem', color: 'var(--text-tertiary)' }}>%</span></div>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                            <div style={{ padding: '0.2rem 0.4rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '4px', fontSize: '0.6rem', fontWeight: '800' }}>+3.4%</div>
                                            <div style={{ padding: '0.2rem 0.4rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', borderRadius: '4px', fontSize: '0.6rem', fontWeight: '800' }}>Optimized</div>
                                        </div>
                                    </div>
                                    <div style={{ height: '70px', width: '100%', position: 'relative' }}>
                                        <svg viewBox="0 0 200 60" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                            <path d="M0 50 Q25 45, 50 35 T100 25 T150 15 T200 10" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" />
                                            <path d="M0 55 Q30 50, 60 45 T120 40 T180 35 T200 32" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="4 4" />
                                            <circle cx="50" cy="35" r="3" fill="var(--accent-primary)" style={{ filter: 'drop-shadow(0 0 4px var(--accent-primary))' }} />
                                            <circle cx="150" cy="15" r="3" fill="var(--accent-primary)" style={{ filter: 'drop-shadow(0 0 4px var(--accent-primary))' }} />
                                        </svg>
                                    </div>
                                </div>

                                {/* Detail Components Row */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                    <div className="depth-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.015)' }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>SOURCES</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                            {[
                                                { label: 'Google AI', val: '94', color: '#4285F4' },
                                                { label: 'GPT-4o', val: '88', color: '#10A37F' },
                                                { label: 'Perplexity', val: '91', color: '#20B2AA' }
                                            ].map((s, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.color }}></div>
                                                        {s.label}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'white' }}>{s.val}%</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="depth-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.015)' }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>REAL-TIME TASKS</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                                <motion.div animate={{ x: [-100, 200] }} transition={{ duration: 2, repeat: Infinity }} style={{ height: '100%', width: '40%', background: 'var(--accent-primary)' }}></motion.div>
                                            </div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', fontWeight: '700' }}>Analyzing semantic drift...</div>
                                            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>Thread active: 14ms</div>
                                        </div>
                                    </div>

                                    <div className="depth-card" style={{ padding: '1rem', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), transparent)', border: '1px solid rgba(139, 92, 246, 0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                                        <Sparkles size={18} color="var(--accent-secondary)" style={{ marginBottom: '0.5rem' }} />
                                        <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'white' }}>Critical Insight</div>
                                        <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>Action required in Perplexity stack</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Radial Background Glow */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '120%',
                        height: '140%',
                        background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15), transparent 70%)',
                        zIndex: -1,
                        pointerEvents: 'none'
                    }}></div>
                </motion.div>
            </motion.div>
        </section>
    )
}

export default Hero
