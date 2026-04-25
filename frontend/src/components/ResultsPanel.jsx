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
            ai_visibility: "Structural Visibility",
            citation_worthiness: "Citation Worthiness",
            semantic_richness: "Semantic Depth",
            technical_readability: "Readability & UX"
        },
        text: {
            overall: "Content Optimization Score",
            ai_visibility: "AI Structure",
            citation_worthiness: "Authority & Trust",
            semantic_richness: "Topic Depth",
            technical_readability: "Readability UX"
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
        ((results.ai_visibility_score || 0) +
            (results.citation_worthiness_score || 0) +
            (results.semantic_coverage_score || 0) +
            (results.technical_readability_score || 0)) / 4
    )

    // Extract new probability metrics if available, accounting for Pydantic wrapper mapping
    const rawProb = results.probability_metrics || (results.llm_scores && results.llm_scores.probability_metrics) || null;
    const probabilityMetrics = rawProb?.details || rawProb;
    const scoreDelta = typeof results.score_delta === 'number' ? results.score_delta : 0;
    const prevCount = results.previous_analyses_count || 0;

    // Helper to check if we have detailed new metrics
    const hasDetailedMetrics = results.llm_scores?.semantic_richness?.details &&
        Object.keys(results.llm_scores.semantic_richness.details).length > 0;

    // Helper to extract all detailed metrics
    const getDetailedMetrics = () => {
        if (!hasDetailedMetrics || !results.llm_scores) return [];

        const detailed = [];
        const categories = ['ai_visibility', 'citation_worthiness', 'semantic_richness', 'technical_readability'];

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
                    <Sparkles size={24} color="var(--accent-primary)" /> GEO Optimization Results
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1rem' }}>
                    {/* Structural Score Row */}
                    <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                            Structural Score 
                            <div className="tooltip-trigger" style={{ cursor: 'help' }}>
                                <Info size={10} />
                                <span className="tooltip-text">
                                    This score measures structural changes only (entity density, readability, answer clarity). 
                                    Actual citation performance depends on publishing and indexing by AI engines.
                                </span>
                            </div>
                            <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', border: '1px solid var(--card-border)', borderRadius: '4px' }}>Deterministic</span>
                        </div>
                        <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                            {results.structural_score?.score ?? results.overall_score ?? 0}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            H-Hierarchy • Readability • FAQ
                        </div>
                    </div>

                    {/* Semantic Score Row */}
                    <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                            Semantic Score <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', border: '1px solid var(--card-border)', borderRadius: '4px' }}>Probabilistic</span>
                        </div>
                        <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--accent-primary)' }}>
                            {results.semantic_score?.score ?? (probabilityMetrics?.probability) ?? (probabilityMetrics?.score) ?? 0}
                            <span style={{ fontSize: '1rem', color: 'var(--text-tertiary)', marginLeft: '0.5rem', fontWeight: '400' }}>
                                ± {results.semantic_score?.variance || 8}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            Richness • Alignment • Intent
                        </div>
                    </div>
                </div>

                {probabilityMetrics?.validation_layer && (
                    <div style={{ marginTop: '1.5rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--card-border)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Validation Queries</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{probabilityMetrics.validation_layer.total_checks}</div>
                        </div>
                        <div style={{ borderLeft: '1px solid var(--card-border)', borderRight: '1px solid var(--card-border)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Actual Citation Rate</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{probabilityMetrics.validation_layer.actual_citation_rate}%</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                                Score Confidence
                                <div className="tooltip-trigger" style={{ cursor: 'help' }}>
                                    <Info size={10} />
                                    <span className="tooltip-text">
                                        The variance between predicted probability and actual engine citations. Low variance indicates high model reliability.
                                    </span>
                                </div>
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: Math.abs(probabilityMetrics.validation_layer.error_gap) > 15 ? 'var(--warning)' : 'var(--success)' }}>
                                {100 - Math.abs(probabilityMetrics.validation_layer.error_gap)}%
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
                            title={currentLabels.ai_visibility}
                            score={results.ai_visibility_score || 0}
                            description="Measures H-tags, schema, and AI-parsable hierarchy."
                            tooltip="AI search engines prioritize content with clear semantic markers and proper schema.org tagging."
                        />
                        <MetricCard
                            title={currentLabels.citation_worthiness}
                            score={results.citation_worthiness_score || 0}
                            description="Analysis of trust signals and factual density."
                            tooltip="High citation worthiness means your content provides verifiable facts and expert consensus."
                        />
                        <MetricCard
                            title={currentLabels.semantic_richness}
                            score={results.semantic_coverage_score || 0}
                            description="Depth of topic coverage and entity anchoring."
                            tooltip="A measure of how comprehensively you cover the 'entities' related to your target keyword."
                        />
                        <MetricCard
                            title={currentLabels.technical_readability}
                            score={results.technical_readability_score || 0}
                            description="Clarity, UX flow, and answer directness."
                            tooltip="Measures if an AI can easily extract a direct answer for its response snippet."
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
