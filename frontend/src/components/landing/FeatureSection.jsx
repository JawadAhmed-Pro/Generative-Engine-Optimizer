import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, TrendingUp, Users, FileText, Zap, Search, Bot, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

function FeatureSection() {
    return (
        <section id="how-it-works" className="section" style={{ 
            background: 'rgba(8, 8, 10, 0.6)', 
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            position: 'relative', 
            zIndex: 1, 
            paddingTop: '6rem', 
            paddingBottom: '6rem' 
        }}>
            <div className="container">
                {/* Section Header */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <span style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        color: 'var(--accent-primary)',
                        padding: '0.6rem 1.25rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        display: 'inline-block',
                        marginBottom: '2rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase'
                    }}>
                        PREMIUM WORKFLOW
                    </span>
                    <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: '800', marginBottom: '2rem', letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
                        From Insight to Authority <br />
                        <span className="text-gradient">in three seamless steps</span>
                    </h2>
                </div>

                <div className="section-group" style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1fr',
                    gap: '5rem',
                    alignItems: 'center',
                    borderBottom: 'none'
                }}>

                    {/* Left - Steps */}
                    <div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                            {/* Step 1 */}
                            <div style={{ display: 'flex', gap: '2rem' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    background: 'var(--accent-primary)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '800',
                                    fontSize: '1.25rem',
                                    flexShrink: 0,
                                    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
                                    color: 'white'
                                }}>1</div>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Asset Ingestion</h3>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '1.05rem' }}>
                                        Paste any URL or raw content. Our engine instantly maps the semantic structure and intent of your assets.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div style={{ display: 'flex', gap: '2rem' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    background: 'var(--accent-secondary)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '800',
                                    fontSize: '1.25rem',
                                    flexShrink: 0,
                                    boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)',
                                    color: 'white'
                                }}>2</div>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Visibility Quantization</h3>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '1.05rem' }}>
                                        We analyze 4 proprietary GEO metrics to reveal exactly how ChatGPT, Gemini, and Google view your authority.
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div style={{ display: 'flex', gap: '2rem' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    background: 'var(--success)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '800',
                                    fontSize: '1.25rem',
                                    flexShrink: 0,
                                    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
                                    color: 'white'
                                }}>3</div>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>AI-First Transformation</h3>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '1.05rem' }}>
                                        Execute the "One-Click Rewrite" to restructure your content for maximum citation probability across all engines.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Link
                            to="/app"
                            className="btn btn-primary"
                            style={{
                                marginTop: '3.5rem',
                                padding: '1.25rem 2.5rem',
                                fontSize: '1.1rem'
                            }}
                        >
                            Claim Your Free Analysis <ArrowRight size={20} />
                        </Link>
                    </div>

                    {/* Right - Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {[
                            { icon: <TrendingUp size={36} color="var(--accent-primary)" />, val: "87%", label: "Visibility Lift", color: "var(--accent-primary)" },
                            { icon: <Users size={36} color="var(--accent-secondary)" />, val: "2.5k+", label: "Top Strategists", color: "var(--accent-secondary)" },
                            { icon: <Search size={36} color="var(--success)" />, val: "50k+", label: "URLs Indexed", color: "var(--success)" },
                            { icon: <Zap size={36} color="var(--warning)" />, val: "<30s", label: "Insight Latency", color: "var(--warning)" }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                whileHover={{
                                    transform: 'translateY(-5px)',
                                    boxShadow: `0 35px 60px -12px rgba(0,0,0,0.2), 0 0 40px -5px ${stat.color}55`,
                                }}
                                className="depth-card"
                                style={{
                                    padding: '2.5rem 1.5rem',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                                    borderColor: stat.color,
                                    boxShadow: `0 0 15px -2px ${stat.color}66, 0 25px 50px -12px rgba(0,0,0,0.15), 0 0 30px -5px ${stat.color}33`,
                                    background: `var(--bg-tertiary)`
                                }}
                            >
                                <div style={{ marginBottom: '1.25rem' }}>{stat.icon}</div>
                                <div style={{ fontSize: '2.75rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>{stat.val}</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FeatureSection
