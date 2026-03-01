import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, TrendingUp, Users, FileText, Zap } from 'lucide-react'

function FeatureSection() {
    return (
        <section id="how-it-works" className="section" style={{ background: 'var(--bg-secondary)', paddingTop: '6rem', paddingBottom: '6rem' }}>
            <div className="container">
                {/* Section Header */}
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <span style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        color: '#60a5fa',
                        padding: '0.4rem 1rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        display: 'inline-block',
                        marginBottom: '1.5rem'
                    }}>
                        HOW IT WORKS
                    </span>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '700', marginBottom: '1rem' }}>
                        From URL to Optimization <br />
                        <span style={{
                            background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>in 30 seconds</span>
                    </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>

                    {/* Left - Steps */}
                    <div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Step 1 */}
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '700',
                                    fontSize: '1.1rem',
                                    flexShrink: 0,
                                    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
                                }}>1</div>
                                <div>
                                    <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem' }}>Paste Your URL or Content</h3>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                        Enter any webpage URL or paste your text content. We support all formats.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '700',
                                    fontSize: '1.1rem',
                                    flexShrink: 0,
                                    boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)'
                                }}>2</div>
                                <div>
                                    <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem' }}>Get Your GEO Score</h3>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                        Our AI analyzes 4 key metrics: visibility, citation potential, semantic depth, and readability.
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '700',
                                    fontSize: '1.1rem',
                                    flexShrink: 0,
                                    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
                                }}>3</div>
                                <div>
                                    <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.5rem' }}>Optimize & Win Citations</h3>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                        One-click rewrite transforms your content into AI-friendly text that gets cited.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Link
                            to="/app"
                            className="btn btn-primary"
                            style={{
                                marginTop: '2.5rem',
                                padding: '1rem 2rem',
                                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
                            }}
                        >
                            Try It Free <ArrowRight size={18} />
                        </Link>
                    </div>

                    {/* Right - Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="glass-card" style={{
                            padding: '2rem',
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.02) 100%)',
                            border: '1px solid rgba(59, 130, 246, 0.2)'
                        }}>
                            <TrendingUp size={32} color="#3b82f6" style={{ marginBottom: '1rem' }} />
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>87%</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Avg. Score Improvement</div>
                        </div>
                        <div className="glass-card" style={{
                            padding: '2rem',
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.02) 100%)',
                            border: '1px solid rgba(139, 92, 246, 0.2)'
                        }}>
                            <Users size={32} color="#8b5cf6" style={{ marginBottom: '1rem' }} />
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>2.5K+</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Active Users</div>
                        </div>
                        <div className="glass-card" style={{
                            padding: '2rem',
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.02) 100%)',
                            border: '1px solid rgba(16, 185, 129, 0.2)'
                        }}>
                            <FileText size={32} color="#10b981" style={{ marginBottom: '1rem' }} />
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>50K+</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>URLs Analyzed</div>
                        </div>
                        <div className="glass-card" style={{
                            padding: '2rem',
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.02) 100%)',
                            border: '1px solid rgba(245, 158, 11, 0.2)'
                        }}>
                            <Zap size={32} color="#f59e0b" style={{ marginBottom: '1rem' }} />
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>&lt;30s</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Analysis Time</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FeatureSection
