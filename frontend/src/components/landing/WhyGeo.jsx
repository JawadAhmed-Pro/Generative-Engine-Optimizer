import { BarChart2, PenTool, Zap, ArrowRight, CheckCircle, Search, Bot, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function WhyGeo() {
    const modules = [
        {
            icon: <BarChart2 size={28} />,
            color: 'rgba(66, 212, 255, 1)', // Neon Blue
            title: "Visibility Analysis",
            description: "Quantify your authority across 4 key GEO metrics. See exactly how AI search engines perceive your assets.",
            features: ["AI Authority Index", "Citation Probability", "Semantic Mapping", "Structural Analysis"],
            link: "/app/visibility"
        },
        {
            icon: <PenTool size={28} />,
            color: 'rgba(180, 100, 255, 1)', // Neon Purple
            title: "Content Optimizer",
            description: "Transform raw data into AI-native, citation-optimized narratives via advanced quantization.",
            features: ["Semantic Rewriting", "Intent Calibration", "Structured Export", "Contextual Scaling"],
            link: "/app/optimization"
        },
        {
            icon: <Zap size={28} />,
            color: '#F59E0B', // var(--warning)
            title: "Simulated Engine",
            description: "Predict citations before they happen. Simulate ChatGPT and Perplexity reasoning cycles in real-time.",
            features: ["Reasoning Simulation", "Citation Forecasting", "Gap Detection", "Strategic Insights"],
            link: "/app/ai-simulator"
        }
    ]

    return (
        <section id="features" className="section" style={{ 
            background: 'transparent', 
            position: 'relative', 
            zIndex: 1, 
            paddingTop: '6rem', 
            paddingBottom: '6rem' 
        }}>
            <div className="container">
                {/* Section Header */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <span style={{
                        background: 'rgba(180, 100, 255, 0.1)',
                        border: '1px solid rgba(180, 100, 255, 0.2)',
                        color: 'rgba(180, 100, 255, 1)',
                        padding: '0.6rem 1.25rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        display: 'inline-block',
                        marginBottom: '1.5rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase'
                    }}>
                        STRATEGIC ADVANTAGE
                    </span>
                    <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: '800', marginBottom: '1.5rem', letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
                        The Architecture of <span className="text-gradient">AI Dominance</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', lineHeight: '1.8', fontSize: '1.1rem' }}>
                        Deploy our specialized intelligence suite to maximize your reach across the next generation of discovery engines.
                    </p>
                </div>

                {/* Module Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                    {modules.map((module, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{
                                transform: 'translateY(-5px)',
                                boxShadow: `0 50px 100px -20px rgba(0,0,0,0.2), 0 0 60px -10px ${module.color}55`,
                            }}
                            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                            className="depth-card"
                            style={{
                                padding: '1.75rem',
                                display: 'flex',
                                flexDirection: 'column',
                                background: 'var(--bg-tertiary)',
                                border: `1px solid ${module.color}`,
                                boxShadow: `0 0 15px -2px ${module.color}66, 0 20px 40px -10px rgba(0,0,0,0.1), 0 0 30px -5px ${module.color}22`,
                                transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Inner Subtle Tint Overlay */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: `linear-gradient(135deg, ${module.color}11, transparent)`,
                                pointerEvents: 'none',
                                zIndex: 0
                            }}></div>

                            {/* Content Wrapper to push above overlay */}
                            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                {/* Icon */}
                                <div style={{
                                    width: '52px',
                                    height: '52px',
                                    background: `${module.color}11`,
                                    borderRadius: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: module.color,
                                    marginBottom: '1.75rem',
                                    border: '1px solid var(--bg-tertiary)',
                                    boxShadow: `0 8px 16px -4px rgba(0,0,0,0.2)`
                                }}>
                                    {module.icon}
                                </div>

                                {/* Title */}
                                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.75rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                                    {module.title}
                                </h3>

                                {/* Description */}
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.75rem', fontSize: '0.95rem', flexGrow: 1 }}>
                                    {module.description}
                                </p>

                                {/* Features */}
                                <ul style={{ listStyle: 'none', marginBottom: '2rem' }}>
                                    {module.features.map((feature, idx) => (
                                        <li key={idx} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.4rem 0',
                                            fontSize: '0.9rem',
                                            color: 'var(--text-secondary)'
                                        }}>
                                            <CheckCircle size={14} color={module.color} style={{ opacity: 0.9 }} />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <Link
                                    to={module.link}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: 'var(--text-primary)',
                                        textDecoration: 'none',
                                        fontWeight: '700',
                                        fontSize: '0.9rem',
                                        paddingTop: '1rem',
                                        borderTop: '1px solid var(--bg-tertiary)',
                                        transition: 'gap 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.gap = '0.75rem'}
                                    onMouseOut={(e) => e.currentTarget.style.gap = '0.5rem'}
                                >
                                    Explore System <ArrowRight size={16} />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default WhyGeo
