import { Link } from 'react-router-dom'
import { Twitter, Linkedin, Github, Mail, Zap, Heart } from 'lucide-react'

function Footer() {
    return (
        <footer style={{
            background: 'rgba(8, 8, 10, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid var(--bg-tertiary)',
            paddingTop: '6rem',
            paddingBottom: '2.5rem',
            position: 'relative',
            zIndex: 1
        }}>
            <div className="container">
                {/* CTA Section */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '6rem',
                    padding: '4rem 2rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '32px',
                    border: '1px solid var(--bg-tertiary)',
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)',
                    boxShadow: '0 40px 100px -20px rgba(0,0,0,0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Living Internal Aurora for CTA */}
                    <div style={{
                        position: 'absolute',
                        top: '-20%',
                        left: '-20%',
                        width: '80%',
                        height: '100%',
                        background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.25), transparent 70%)',
                        filter: 'blur(80px)',
                        zIndex: 0,
                        pointerEvents: 'none',
                        animation: 'aurora-float-1 20s infinite alternate'
                    }}></div>
                    <div style={{
                        position: 'absolute',
                        bottom: '-20%',
                        right: '-10%',
                        width: '70%',
                        height: '100%',
                        background: 'radial-gradient(circle at center, rgba(37, 99, 235, 0.2), transparent 70%)',
                        filter: 'blur(100px)',
                        zIndex: 0,
                        pointerEvents: 'none',
                        animation: 'aurora-float-2 25s infinite alternate-reverse'
                    }}></div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h2 style={{
                            fontSize: 'clamp(2rem, 4vw, 3rem)',
                            fontWeight: '800',
                            marginBottom: '1.5rem',
                            letterSpacing: '-0.04em',
                            color: 'var(--text-primary)'
                        }}>
                            Dominate the Search <br />
                            <span className="text-gradient">Experience of Tomorrow</span>
                        </h2>
                        <p style={{
                            color: 'var(--text-secondary)',
                            marginBottom: '2.5rem',
                            maxWidth: '550px',
                            margin: '0 auto 2.5rem',
                            fontSize: '1.1rem',
                            lineHeight: '1.7'
                        }}>
                            Deploy the world's first GEO platform and secure your position in the AI-driven discovery ecosystem.
                        </p>
                        <Link
                            to="/app"
                            className="btn btn-primary"
                            style={{
                                padding: '1.25rem 3.5rem',
                                fontSize: '1.1rem',
                                background: 'var(--accent-primary)',
                                boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2)'
                            }}
                        >
                            Initialize Analysis
                        </Link>
                    </div>
                </div>

                {/* Footer Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '2.5rem',
                    marginBottom: '4rem'
                }}>
                    {/* Brand */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <img
                                src="/no_bg_logo.png"
                                alt="GEO Logo"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    objectFit: 'contain'
                                }}
                            />
                            <span style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>GEO Tool</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '2rem', maxWidth: '320px', fontSize: '1rem' }}>
                            The authoritative engine for Generative Engine Optimization. Engineering visibility in the age of intelligence.
                        </p>
                        <div style={{ display: 'flex', gap: '1.25rem' }}>
                            <a href="https://twitter.com/geotool" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-tertiary)', transition: 'color 0.2s' }}>
                                <Twitter size={22} />
                            </a>
                            <a href="https://linkedin.com/company/geotool" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-tertiary)', transition: 'color 0.2s' }}>
                                <Linkedin size={22} />
                            </a>
                            <a href="https://github.com/geotool" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-tertiary)', transition: 'color 0.2s' }}>
                                <Github size={22} />
                            </a>
                            <a href="mailto:contact@geo-tool.site" style={{ color: 'var(--text-tertiary)', transition: 'color 0.2s' }}>
                                <Mail size={22} />
                            </a>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 style={{ fontWeight: '700', marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>ENGINE</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <li><Link to="/app/visibility" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.95rem' }}>Visibility Analysis</Link></li>
                            <li><Link to="/app/optimization" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.95rem' }}>Content Optimizer</Link></li>
                            <li><Link to="/app/ai-simulator" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.95rem' }}>AI Simulator</Link></li>
                            <li><Link to="/app/projects" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.95rem' }}>Network</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ fontWeight: '700', marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>RESOURCES</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <li><Link to="/docs" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.95rem' }}>Documentation</Link></li>
                            <li><Link to="/cases" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.95rem' }}>Case Studies</Link></li>
                            <li><Link to="/api" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.95rem' }}>API Control</Link></li>
                            <li><a href="https://status.geo-tool.site" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.95rem' }}>System Status</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div style={{
                    borderTop: '1px solid var(--bg-tertiary)',
                    paddingTop: '2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1.5rem'
                }}>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.95rem', fontWeight: '500' }}>
                        © 2026 GEO Intelligence Sytems.
                    </div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                        Next-Gen GEO Support <Heart size={16} color="var(--accent-primary)" fill="currentColor" />
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
