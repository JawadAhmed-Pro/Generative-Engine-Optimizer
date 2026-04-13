import { CheckCircle, AlertTriangle, XCircle, Sparkles, TrendingUp, TrendingDown, Minus, Target, Award, Shield, UserCheck, Zap } from 'lucide-react'
import MetricCard from './MetricCard'
import SuggestionList from './SuggestionList'
import ExportButton from './ExportButton'
import RAGInsights from './RAGInsights'

function ResultsPanel({ results, onReset, context = 'url' }) {
    // Label mappings based on context
    const LABELS = {
        url: {
            overall: "Overall GEO Score",
            ai_visibility: "AI Search Visibility",
            citation_worthiness: "Citation Worthiness",
            semantic_richness: "Semantic Coverage",
            technical_readability: "Technical Readability"
        },
        text: {
            overall: "Content Optimization Score",
            ai_visibility: "Structure & AI Readiness",
            citation_worthiness: "Authority & Trust",
            semantic_richness: "Topic Depth & Intent",
            technical_readability: "Readability & Clarity"
        }
    }
    const currentLabels = LABELS[context] || LABELS.url;

    // Helper to generate SVG sparkline path
    const generateSparkline = (data) => {
        if (!data || data.length < 2) return null;

        const width = 120;
        const height = 40;
        const padding = 4;

        // Find min and max scores for scaling
        const scores = data.map(d => d.score);
        const min = Math.min(...scores) - 5; // Add some padding
        const max = Math.max(...scores) + 5;
        const range = max - min || 1; // Prevent division by zero

        // Calculate points
        const points = data.map((d, i) => {
            const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
            const y = height - padding - ((d.score - min) / range) * (height - padding * 2);
            return `${x},${y}`;
        }).join(' L ');

        return (
            <svg width={width} height={height} style={{ overflow: 'visible' }}>
                <path
                    d={`M ${points}`}
                    fill="none"
                    stroke="var(--accent-primary)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))' }}
                />
                {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
                    const y = height - padding - ((d.score - min) / range) * (height - padding * 2);
                    return (
                        <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="4"
                            fill={i === data.length - 1 ? 'var(--accent-primary)' : 'var(--bg-secondary)'}
                            stroke="var(--accent-primary)"
                            strokeWidth="2"
                        />
                    );
                })}
            </svg>
        );
    }

    const getScoreClass = (score) => {
        if (score >= 75) return 'score-high'
        if (score >= 50) return 'score-medium'
        return 'score-low'
    }

    const overallScore = Math.round(
        (results.ai_visibility_score +
            results.citation_worthiness_score +
            results.semantic_coverage_score +
            results.technical_readability_score) / 4
    )

    // Extract new probability metrics if available, accounting for Pydantic wrapper mapping
    const rawProb = results.probability_metrics || (results.llm_scores && results.llm_scores.probability_metrics) || null;
    const probabilityMetrics = rawProb?.details || rawProb;
    const scoreDelta = results.score_delta;
    const prevCount = results.previous_analyses_count;

    // Helper to check if we have detailed new metrics
    const hasDetailedMetrics = results.llm_scores &&
        results.llm_scores.semantic_richness &&
        results.llm_scores.semantic_richness.details &&
        Object.keys(results.llm_scores.semantic_richness.details).length > 0;

    // Helper to extract all detailed metrics
    const getDetailedMetrics = () => {
        if (!hasDetailedMetrics) return [];

        const detailed = [];
        const categories = ['ai_visibility', 'citation_worthiness', 'semantic_richness', 'technical_readability'];

        categories.forEach(cat => {
            if (results.llm_scores[cat] && results.llm_scores[cat].details) {
                Object.entries(results.llm_scores[cat].details).forEach(([key, value]) => {
                    // Try to generate a nice title from key
                    // e.g. 'product_data_completeness' -> 'Product Data Completeness'
                    const title = key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

                    detailed.push({
                        key: key,
                        title: title,
                        score: value
                    });
                });
            }
        });

        // Remove duplicates if any logic causes overlap
        return detailed.filter((v, i, a) => a.findIndex(t => (t.key === v.key)) === i);
    }

    const detailedMetrics = getDetailedMetrics();

    return (
        <div>
            {/* Probability Score Header */}
            <div className="glass-card" style={{ marginBottom: '2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <h2 style={{ marginBottom: '1rem', fontFamily: 'inherit' }}>
                    Citation Probability
                </h2>

                {results.intent_analysis && (
                    <div className={`intent-badge intent-${results.intent_analysis.primary_intent?.toLowerCase().replace(' ', '-')}`}>
                        <Target size={14} />
                        Intent: {results.intent_analysis.primary_intent}
                    </div>
                )}

                {probabilityMetrics ? (
                    <>
                        <div className={`score-badge ${getScoreClass(probabilityMetrics.probability)}`} style={{ fontSize: '3.5rem', padding: '2rem', display: 'inline-block' }}>
                            {probabilityMetrics.probability}%
                        </div>
                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                            Based on our research models, your content has a <strong>{probabilityMetrics.probability}%</strong> chance of being cited by AI engines as a source.
                        </p>
                        <div style={{ fontSize: '0.85rem', color: 'var(--accent)', marginTop: '0.5rem' }}>
                            Industry Average: {probabilityMetrics?.competitor_average || 'N/A'}% | Confidence Interval: {probabilityMetrics?.confidence_interval?.low || 'N/A'}% - {probabilityMetrics?.confidence_interval?.high || 'N/A'}%
                        </div>
                    </>
                ) : (
                    <>
                        <div className={`score-badge ${getScoreClass(overallScore)}`} style={{ fontSize: '3rem', padding: '1.5rem', display: 'inline-block' }}>
                            {overallScore}/100
                        </div>
                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            {overallScore >= 75 ? <><CheckCircle size={18} color="var(--success)" /> Excellent optimization for AI search!</>
                                : overallScore >= 50 ? <><AlertTriangle size={18} color="var(--warning)" /> Good start, but room for improvement</>
                                    : <><XCircle size={18} color="var(--error)" /> Needs significant optimization</>}
                        </p>
                    </>
                )}

                {/* Progress Tracking Widget */}
                {prevCount > 1 && scoreDelta !== undefined && (
                    <div style={{
                        marginTop: '1.5rem',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '1rem',
                        borderRadius: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        flexWrap: 'wrap',
                        justifyContent: 'center'
                    }}>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Historical Progress</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Analyzed {prevCount} times</div>
                        </div>

                        <div style={{ height: '30px', width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>

                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: scoreDelta > 0 ? 'var(--success)' : scoreDelta < 0 ? 'var(--error)' : 'var(--text-secondary)' }}>
                            {scoreDelta > 0 ? '+' : ''}{scoreDelta.toFixed(1)} pts
                        </div>

                        {results.historical_trend && (
                            <>
                                <div style={{ height: '30px', width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {generateSparkline(results.historical_trend)}
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="btn btn-secondary" onClick={onReset}>Analyze Another</button>
                    <ExportButton results={results} />
                </div>
            </div>

            {/* E-E-A-T Signals */}
            {results.eeat_analysis && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={18} color="var(--accent-primary)" /> AI Trust & Authority (E-E-A-T)
                    </h3>
                    <div className="eeat-grid">
                        <div className="eeat-card">
                            <div className="eeat-label">Experience</div>
                            <div className="eeat-value">{results.eeat_analysis.experience}<span>/100</span></div>
                            <div className="eeat-bar-bg">
                                <div className="eeat-bar-fill" style={{ width: `${results.eeat_analysis.experience}%` }}></div>
                            </div>
                        </div>
                        <div className="eeat-card">
                            <div className="eeat-label">Expertise</div>
                            <div className="eeat-value">{results.eeat_analysis.expertise}<span>/100</span></div>
                            <div className="eeat-bar-bg">
                                <div className="eeat-bar-fill" style={{ width: `${results.eeat_analysis.expertise}%` }}></div>
                            </div>
                        </div>
                        <div className="eeat-card">
                            <div className="eeat-label">Authoritativeness</div>
                            <div className="eeat-value">{results.eeat_analysis.authoritativeness}<span>/100</span></div>
                            <div className="eeat-bar-bg">
                                <div className="eeat-bar-fill" style={{ width: `${results.eeat_analysis.authoritativeness}%` }}></div>
                            </div>
                        </div>
                        <div className="eeat-card">
                            <div className="eeat-label">Trustworthiness</div>
                            <div className="eeat-value">{results.eeat_analysis.trustworthiness}<span>/100</span></div>
                            <div className="eeat-bar-bg">
                                <div className="eeat-bar-fill" style={{ width: `${results.eeat_analysis.trustworthiness}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Probability Breakdown Factors */}
            {probabilityMetrics && probabilityMetrics.factors && probabilityMetrics.factors.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={18} color="var(--accent-primary)" /> What's Driving Your Probability?
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                        {probabilityMetrics.factors.map((factor, i) => (
                            <div key={i} className="glass-card" style={{ padding: '1.25rem', borderLeft: `4px solid ${factor.type === 'positive' ? 'var(--success)' : 'var(--error)'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <strong style={{ fontSize: '1.05rem' }}>{factor.factor}</strong>
                                    <span style={{
                                        color: factor.type === 'positive' ? 'var(--success)' : 'var(--error)',
                                        fontWeight: '700',
                                        background: factor.type === 'positive' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.85rem'
                                    }}>
                                        {factor.impact}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{factor.description}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Metric Cards Grid */}
            <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Detailed Analysis Metrics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {hasDetailedMetrics ? (
                    detailedMetrics.map((metric) => (
                        <MetricCard
                            key={metric.key}
                            title={metric.title}
                            score={metric.score}
                            description=""
                        />
                    ))
                ) : (
                    // Fallback to old 4 metrics if no details found
                    <>
                        <MetricCard
                            title={currentLabels.ai_visibility}
                            score={results.ai_visibility_score}
                            description={context === 'text' ? "How well structured for AI understanding" : "How easily AI models can find and cite this content"}
                        />
                        <MetricCard
                            title={currentLabels.citation_worthiness}
                            score={results.citation_worthiness_score}
                            description={context === 'text' ? "Trust signals and expertise indicators" : "Likelihood of being referenced by AI as authoritative"}
                        />
                        <MetricCard
                            title={currentLabels.semantic_richness}
                            score={results.semantic_coverage_score}
                            description={context === 'text' ? "Vocabulary depth and user intent match" : "Depth and richness of topic coverage"}
                        />
                        <MetricCard
                            title={currentLabels.technical_readability}
                            score={results.technical_readability_score}
                            description={context === 'text' ? "Clarity, flow, and formatting" : "Structure, readability, and freshness signals"}
                        />
                    </>
                )}
            </div>

            {/* RAG Insights */}
            {results.content_item_id && (
                <RAGInsights
                    contentItemId={results.content_item_id}
                    initialInsights={results.insights}
                />
            )}

            {/* Suggestions */}
            {results.suggestions && results.suggestions.length > 0 && (
                <SuggestionList
                    suggestions={results.suggestions}
                    contentItemId={results.content_item_id}
                    context={context}
                />
            )}
        </div>
    )
}

export default ResultsPanel
