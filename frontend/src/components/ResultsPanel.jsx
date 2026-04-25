import { useState } from 'react'
import { CheckCircle, AlertTriangle, XCircle, Sparkles, TrendingUp, TrendingDown, Minus, Wand2, RefreshCw, Info } from 'lucide-react'
import MetricCard from './MetricCard'
import SuggestionList from './SuggestionList'
import ExportButton from './ExportButton'
import RAGInsights from './RAGInsights'
import axios from 'axios'

function ResultsPanel({ results, onReset, context = 'url' }) {
    const [fixingIndex, setFixingIndex] = useState(null);
    const [fixedContent, setFixedContent] = useState(null);

    if (!results) return null;

    // Label mappings based on context
    const LABELS = {
        url: {
            overall: "Overall GEO Score",
            structural_clarity: "Structural Clarity",
            citation_worthiness: "Citation Worthiness",
            semantic_coverage: "Semantic Coverage",
            freshness_authority: "Freshness & Authority"
        },
        text: {
            overall: "Content Optimization Score",
            structural_clarity: "AI Structure",
            citation_worthiness: "Authority & Trust",
            semantic_coverage: "Topic Depth",
            freshness_authority: "Recency & Links"
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

    const overallScore = results.overall_visibility_score ?? Math.round(
        ((results.structural_clarity_score || 0) +
            (results.citation_worthiness_score || 0) +
            (results.semantic_coverage_score || 0) +
            (results.freshness_authority_score || 0)) / 4
    )

    const queryIntent = results.intent_analysis?.query_intent || 'General';
    const chatgptMetrics = results.llm_scores?.structural_clarity?.details || {};
    const citationMetrics = results.llm_scores?.citation_worthiness?.details || {};

    // Extract new probability metrics if available, accounting for Pydantic wrapper mapping
    const rawProb = results.probability_metrics || (results.llm_scores && results.llm_scores.probability_metrics) || null;
    const probabilityMetrics = rawProb?.details || rawProb;
    const scoreDelta = typeof results.score_delta === 'number' ? results.score_delta : 0;
    const prevCount = results.previous_analyses_count || 0;

    // Helper to check if we have detailed new metrics
    const hasDetailedMetrics = results.llm_scores?.semantic_coverage?.details &&
        Object.keys(results.llm_scores.semantic_coverage.details).length > 0;

    // Helper to extract all detailed metrics
    const getDetailedMetrics = () => {
        if (!hasDetailedMetrics || !results.llm_scores) return [];

        const detailed = [];
        const categories = ['structural_clarity', 'citation_worthiness', 'semantic_coverage', 'freshness_authority'];

        categories.forEach(cat => {
            const catData = results.llm_scores[cat];
            if (catData?.details) {
                Object.entries(catData.details).forEach(([key, value]) => {
                    const title = key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

                    detailed.push({
                        key: key,
                        title: title,
                        score: value,
                        unit: (key.includes('count') || key.includes('found') || key.includes('density')) ? "" : "/ 100"
                    });
                });
            }
        });

        return detailed.filter((v, i, a) => a.findIndex(t => (t.key === v.key)) === i);
    }

    const detailedMetrics = getDetailedMetrics();

    return (
        <div>
            {/* Probability Score Header */}
            <div className="depth-card" style={{ marginBottom: '2rem', textAlign: 'center', position: 'relative', overflow: 'visible' }}>
                <h2 style={{ marginBottom: '1.5rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Sparkles size={24} color="var(--accent-primary)" /> ChatGPT Visibility Analysis
                </h2>

                <div style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '100px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Detected Intent:</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)' }}>{queryIntent}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1rem' }}>
                    {/* Structural Score Row */}
                    <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                            Structural Score 
                            <div className="tooltip-trigger" style={{ cursor: 'help' }}>
                                <Info size={10} />
                                <span className="tooltip-text">
                                    Measures atomic structure: Scrapability ({chatgptMetrics.structural_scrapability || 0}%), Formatting, and Noise ({chatgptMetrics.narrative_noise || 0}%).
                                </span>
                            </div>
                        </div>
                        <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                            {results.structural_clarity_score ?? results.overall_score ?? 0}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            Scrapability • Noise Penalty • FAQ
                        </div>
                    </div>

                    {/* Semantic Score Row */}
                    <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                            Citation Potential <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', border: '1px solid var(--card-border)', borderRadius: '4px' }}>AI Confidence</span>
                        </div>
                        <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--accent-primary)' }}>
                            {results.overall_visibility_score ?? results.semantic_coverage_score ?? 0}
                            <span style={{ fontSize: '1rem', color: 'var(--text-tertiary)', marginLeft: '0.5rem', fontWeight: '400' }}>
                                %
                            </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            Claim Quality: {citationMetrics.atomic_claim_quality || 0}/100
                        </div>
                    </div>
                </div>

                {probabilityMetrics?.validation_layer && (
                    <div style={{ marginTop: '1.5rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--card-border)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Target Keyword</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{probabilityMetrics.validation_layer.queries_tested?.[0] || 'N/A'}</div>
                        </div>
                        <div style={{ borderLeft: '1px solid var(--card-border)', borderRight: '1px solid var(--card-border)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Citation Status</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: probabilityMetrics.validation_layer.citation_status === 'Cited' ? 'var(--success)' : 'var(--text-tertiary)' }}>{probabilityMetrics.validation_layer.citation_status}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                                Confidence
                                <div className="tooltip-trigger" style={{ cursor: 'help' }}>
                                    <Info size={10} />
                                    <span className="tooltip-text">
                                        {probabilityMetrics.validation_layer.snapshot_label}
                                    </span>
                                </div>
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: Math.abs(probabilityMetrics.validation_layer.error_gap) > 15 ? 'var(--warning)' : 'var(--success)' }}>
                                {100 - Math.min(100, Math.abs(probabilityMetrics.validation_layer.error_gap))}%
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>Status: {probabilityMetrics.validation_layer.status}</div>
                        </div>
                    </div>
                )}
                {/* Progress Tracking Widget */}
                {prevCount > 1 && typeof scoreDelta === 'number' && (
                    <div style={{
                        marginTop: '1.5rem',
                        background: 'var(--bg-tertiary)',
                        padding: '1rem',
                        borderRadius: '8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        border: '1px solid var(--card-border)'
                    }}>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Historical Progress</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Analyzed {prevCount} times</div>
                        </div>

                        <div style={{ height: '30px', width: '1px', background: 'var(--card-border)' }}></div>

                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: scoreDelta > 0 ? 'var(--success)' : scoreDelta < 0 ? 'var(--error)' : 'var(--text-secondary)' }}>
                            {scoreDelta > 0 ? '+' : ''}{(scoreDelta || 0).toFixed(1)} pts
                        </div>

                        {results.historical_trend && (
                            <>
                                <div style={{ height: '30px', width: '1px', background: 'var(--card-border)' }}></div>
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

                {/* NEW: Citation Warnings / Grounding Gaps */}
                {(results.analysis?.citation_warnings || results.citation_warnings || results.missing_citations) && (results.analysis?.citation_warnings?.length > 0 || results.citation_warnings?.length > 0 || results.missing_citations?.length > 0) && (
                    <div style={{ 
                        marginTop: '2rem', 
                        padding: '1.5rem', 
                        background: 'rgba(239, 68, 68, 0.05)', 
                        borderRadius: '12px', 
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        textAlign: 'left'
                    }}>
                        <h4 style={{ color: 'var(--error)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertTriangle size={18} /> Claims Needing Real Sources
                        </h4>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {(() => {
                                const warnings = results.analysis?.citation_warnings || results.citation_warnings || results.missing_citations;
                                const warningList = Array.isArray(warnings) ? warnings : (typeof warnings === 'string' ? [warnings] : []);
                                
                                return warningList.map((flag, i) => (
                                    <div key={i} style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.6rem' }}>
                                        <span style={{ color: 'var(--error)' }}>⚠️</span>
                                        <span>{flag}</span>
                                    </div>
                                ));
                            })()}
                        </div>
                        <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                            Note: The Anti-Hallucination filter blocked the AI from inventing data for these claims. Please provide real evidence to improve trust scores.
                        </p>
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
                            <div key={i} className="depth-card" style={{ padding: '1.25rem', borderLeft: `4px solid ${factor.type === 'positive' ? 'var(--success)' : 'var(--error)'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <strong style={{ fontSize: '1.05rem' }}>{factor.factor}</strong>
                                    <span style={{
                                        color: factor.type === 'positive' ? 'var(--success)' : 'var(--error)',
                                        fontWeight: '700',
                                        background: factor.type === 'positive' ? '#0a1d15' : '#1d0a0a',
                                        border: `1px solid ${factor.type === 'positive' ? 'var(--success)' : 'var(--error)'}33`,
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
                            unit={metric.unit}
                            description=""
                        />
                    ))
                ) : (
                    // Fallback to old 4 metrics if no details found
                    <>
                        <MetricCard
                            title={currentLabels.structural_clarity}
                            score={results.structural_clarity_score || 0}
                            description="Measures H-tags, direct answers, and AI-parsable clarity."
                            tooltip="AI search engines prioritize content with clear semantic markers and proper answer structures."
                        />
                        <MetricCard
                            title={currentLabels.citation_worthiness}
                            score={results.citation_worthiness_score || 0}
                            description="Analysis of E-E-A-T signals and factual density."
                            tooltip="High citation worthiness means your content provides verifiable facts and expert consensus."
                        />
                        <MetricCard
                            title={currentLabels.semantic_coverage}
                            score={results.semantic_coverage_score || 0}
                            description="Depth of intent alignment and information gain."
                            tooltip="A measure of how comprehensively you cover the 'entities' related to your target keyword."
                        />
                        <MetricCard
                            title={currentLabels.freshness_authority}
                            score={results.freshness_authority_score || 0}
                            description="Recency, sameAs entities, and outbound authority."
                            tooltip="Measures if your content is up-to-date and linked to high-authority knowledge graphs."
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
                    rawContent={results.raw_content || ""}
                />
            )}
        </div>
    )
}

export default ResultsPanel
