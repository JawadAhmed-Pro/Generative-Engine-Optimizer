import { Link } from 'react-router-dom'
import { Twitter, Linkedin, Github, Mail, Zap, Heart } from 'lucide-react'

function Footer() {
    return (
        <footer style={{
            background: 'linear-gradient(180deg, var(--bg-primary) 0%, rgba(15, 23, 42, 1) 100%)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            paddingTop: '5rem',
            paddingBottom: '2rem'
        }}>
            <div className="container">
                {/* CTA Section */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '5rem',
                    padding: '4rem 2rem',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <h2 style={{
                        fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                        fontWeight: '700',
                        marginBottom: '1rem'
                    }}>
                        Ready to Dominate AI Search?
                    </h2>
                    <p style={{
                        color: 'var(--text-secondary)',
                        marginBottom: '2rem',
                        maxWidth: '500px',
                        margin: '0 auto 2rem'
                    }}>
                        Join thousands of content creators optimizing for the future of search.
                    </p>
                    <Link
                        to="/app"
                        className="btn btn-primary"
                        style={{
                            padding: '1rem 3rem',
                            fontSize: '1.1rem',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            boxShadow: '0 10px 40px rgba(59, 130, 246, 0.4)'
                        }}
                    >
                        Start Optimizing Free
                    </Link>
                </div>

                {/* Footer Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr',
                    gap: '3rem',
                    marginBottom: '4rem'
                }}>
                    {/* Brand */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <img
                                src="/logo.jpg"
                                alt="Logo"
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    objectFit: 'contain',
                                    borderRadius: '10px'
                                }}
                            />
                            <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>GEO Tool</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1.5rem', maxWidth: '280px' }}>
                            The first AI-powered platform for Generative Engine Optimization. Dominate ChatGPT, Google AI, and Perplexity.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <a href="#" style={{ color: 'var(--text-tertiary)', transition: 'color 0.2s' }}>
                                <Twitter size={20} />
                            </a>
                            <a href="#" style={{ color: 'var(--text-tertiary)', transition: 'color 0.2s' }}>
                                <Linkedin size={20} />
                            </a>
                            <a href="#" style={{ color: 'var(--text-tertiary)', transition: 'color 0.2s' }}>
                                <Github size={20} />
                            </a>
                            <a href="#" style={{ color: 'var(--text-tertiary)', transition: 'color 0.2s' }}>
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 style={{ fontWeight: '600', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'white' }}>Product</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <li><Link to="/app/visibility" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Visibility Analysis</Link></li>
                            <li><Link to="/app/optimization" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Content Optimizer</Link></li>
                            <li><Link to="/app/ai-simulator" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>AI Simulator</Link></li>
                            <li><Link to="/app/projects" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Projects</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 style={{ fontWeight: '600', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'white' }}>Resources</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Documentation</a></li>
                            <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Blog</a></li>
                            <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>API Reference</a></li>
                            <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Changelog</a></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 style={{ fontWeight: '600', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'white' }}>Company</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>About</a></li>
                            <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Contact</a></li>
                            <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Privacy Policy</a></li>
                            <li><a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Terms of Service</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    paddingTop: '2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                        © 2024 GEO Tool. All rights reserved.
                    </div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        Made with <Heart size={14} color="#ef4444" /> for the AI era
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
