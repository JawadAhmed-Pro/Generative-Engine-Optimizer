import { BarChart2, PenTool, Zap, ArrowRight, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

function WhyGeo() {
    const modules = [
        {
            icon: <BarChart2 size={28} />,
            color: '#3b82f6',
            gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%)',
            title: "Visibility Analysis",
            description: "Analyze any URL or content against 4 key GEO metrics. See exactly how AI search engines perceive your pages.",
            features: ["AI Visibility Score", "Citation Worthiness", "Semantic Coverage", "Technical Readability"],
            link: "/app/visibility"
        },
        {
            icon: <PenTool size={28} />,
            color: '#8b5cf6',
            gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.05) 100%)',
            title: "Content Optimizer",
            description: "Transform any content into AI-friendly, citation-worthy text. One-click rewriting powered by advanced LLMs.",
            features: ["Smart Rewriting", "Side-by-Side Compare", "Markdown Export", "Word Count Analysis"],
            link: "/app/optimization"
        },
        {
            icon: <Zap size={28} />,
            color: '#f59e0b',
            gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.05) 100%)',
            title: "AI Simulator",
            description: "Test if AI would cite your content for any query. Simulate ChatGPT and Perplexity responses before publishing.",
            features: ["Query Testing", "Citation Prediction", "Gap Analysis", "Competitor Insights"],
            link: "/app/ai-simulator"
        }
    ]

    return (
        <section id="features" className="section" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
            <div className="container">
                {/* Section Header */}
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <span style={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        color: '#a78bfa',
                        padding: '0.4rem 1rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        display: 'inline-block',
                        marginBottom: '1.5rem'
                    }}>
                        POWERFUL MODULES
                    </span>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '700', marginBottom: '1rem' }}>
                        Everything You Need to <span style={{
                            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>Dominate AI Search</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.7' }}>
                        Three specialized tools working together to maximize your visibility in ChatGPT, Google AI, and Perplexity.
                    </p>
                </div>

                {/* Module Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {modules.map((module, index) => (
                        <div
                            key={index}
                            className="glass-card"
                            style={{
                                padding: '2rem',
                                background: module.gradient,
                                border: `1px solid ${module.color}20`,
                                transition: 'transform 0.3s, box-shadow 0.3s'
                            }}
                        >
                            {/* Icon */}
                            <div style={{
                                width: '56px',
                                height: '56px',
                                background: `${module.color}20`,
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: module.color,
                                marginBottom: '1.5rem'
                            }}>
                                {module.icon}
                            </div>

                            {/* Title */}
                            <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                                {module.title}
                            </h3>

                            {/* Description */}
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                                {module.description}
                            </p>

                            {/* Features */}
                            <ul style={{ listStyle: 'none', marginBottom: '1.5rem' }}>
                                {module.features.map((feature, idx) => (
                                    <li key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.4rem 0',
                                        fontSize: '0.9rem',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        <CheckCircle size={16} color={module.color} />
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
                                    color: module.color,
                                    textDecoration: 'none',
                                    fontWeight: '600',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Try {module.title} <ArrowRight size={16} />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default WhyGeo
