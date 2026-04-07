"""
Citation Probability Model

Converts raw GEO scores into a concrete "Probability of Citation" percentage
based on research-backed multipliers and market data.
"""
from typing import Dict, Any, List

class CitationProbabilityModel:
    """Calculates research-backed citation probabilities."""

    # Baseline probabilities based on overall score (0-100)
    # A score of 50 = ~15% chance, 80 = ~45% chance before multipliers
    
    def calculate_probability(
        self, 
        overall_score: float, 
        rule_scores: Dict[str, Any], 
        llm_scores: Dict[str, Any],
        content_type: str = "general"
    ) -> Dict[str, Any]:
        """
        Calculate final citation probability and provide a breakdown of factors.
        """
        # 1. Start with base probability derived from the overall GEO score
        # Recalibrated S-curve for better real-world AI search alignment (2025 Benchmarks)
        if overall_score < 40:
            base_prob = overall_score * 0.3
        elif overall_score < 75:
            base_prob = 12 + ((overall_score - 40) * 1.2)
        else:
            base_prob = 54 + ((overall_score - 75) * 1.8)
            
        base_prob = max(1.0, min(85.0, base_prob)) # Cap base at 85%

        factors: List[Dict[str, Any]] = []
        multiplier_total = 1.0

        # SCHEMA & STRUCTURE
        schema_data = rule_scores.get('schema', {})
        schema_types = schema_data.get('details', {}).get('schema_types', [])
        has_faq = 'FAQPage' in schema_types
        has_article = 'Article' in schema_types or 'NewsArticle' in schema_types or 'BlogPosting' in schema_types
        
        if has_faq:
            # 2025 Research: FAQ schema provides "Clean Extraction" lift
            multiplier_total *= 1.6
            factors.append({
                "factor": "FAQ Schema Lift",
                "impact": "+60% lift",
                "type": "positive",
                "description": "Crucial for capturing 'People Also Ask' style AI prompts."
            })
            
        # EXPERT QUOTATIONS (New 2025 Factor)
        # Check rule-based authority for expert citations
        authority_data = rule_scores.get('authority', {})
        has_expert_quotes = authority_data.get('details', {}).get('expert_mentions', 0) > 0
        if has_expert_quotes:
            # Princeton GEO-bench: Expert quotes give +29% to +41% lift
            multiplier_total *= 1.35
            factors.append({
                "factor": "Expert Quotations",
                "impact": "+35% lift",
                "type": "positive",
                "description": "Named expert credentials significantly boost extraction confidence."
            })

        # VERIFIABLE DATA & STATISTICS
        stat_count = authority_data.get('details', {}).get('statistics', 0)
        if stat_count >= 5:
            # Princeton GEO-bench: Statistics are the highest-impact strategy (+40% peak)
            multiplier_total *= 1.3
            factors.append({
                "factor": "Empirical Data Density",
                "impact": "+30% lift",
                "type": "positive",
                "description": "AI engines heavily prefer answers grounded in verifiable numbers."
            })

        # INLINE SOURCE CITATIONS
        ext_links = authority_data.get('details', {}).get('external_links', 0)
        if ext_links >= 3:
            # Research: +22% to +40% citation probability lift
            multiplier_total *= 1.31
            factors.append({
                "factor": "Authoritative Citations",
                "impact": "+31% lift",
                "type": "positive",
                "description": "Linking to .gov/.edu/primary research increases grounding probability."
            })

        # FRESHNESS / CONTENT DECAY (Topic-Aware calibration)
        freshness_data = rule_scores.get('freshness', {})
        has_recent_date = freshness_data.get('details', {}).get('has_update_info', False)
        
        # Check for Content Decay penalty
        if not has_recent_date:
             # Topic-Aware Penalty Logic: 
             # Evergreen topics (Education) don't decay as fast as News/Trends.
             if content_type == 'education':
                 decay_multiplier = 0.85 # Slight 15% penalty for lack of maintenance signals
                 penalty_desc = "Foundational topics decay slowly, but lack of recent 'Updated 2025' markers still impacts trust."
                 impact_label = "-15% penalty"
             else:
                 decay_multiplier = 0.37 # Full 63% penalty for general/temporal content
                 penalty_desc = "Legacy content (>180 days) loses up to 63% of citation share in temporal AI search."
                 impact_label = "-63% penalty"

             multiplier_total *= decay_multiplier
             factors.append({
                "factor": "Content Decay",
                "impact": impact_label,
                "type": "negative",
                "description": penalty_desc
             })
        else:
            factors.append({
                "factor": "Freshness Optimization",
                "impact": "High Retention",
                "type": "positive",
                "description": "Recent updates (2025/26) are heavily prioritized by AI search engines."
            })

        # 4. CONTENT LENGTH / DEPTH (Modified)
        details = rule_scores.get('structure', {}).get('details', {})
        word_count = details.get('word_count', 0)
        authority_score = llm_scores.get('citation_worthiness', {}).get('score', 50)
        
        if word_count < 500 and authority_score < 75:
            multiplier_total *= 0.65 # Thin content penalty for low authority
            factors.append({
                "factor": "Thin Grounding Density",
                "impact": "-35% penalty",
                "type": "negative",
                "description": "Short content lacking authority fails AI grounding thresholds."
            })

        # Final average based calculation
        final_prob = base_prob * multiplier_total
        
        # Hard caps
        final_prob = max(1.0, min(99.0, final_prob))
        
        # Generate competitor average for comparison
        competitor_avg = max(15.0, final_prob * 0.6) # Simplified baseline

        return {
            "probability": round(final_prob, 1),
            "base_probability": round(base_prob, 1),
            "multiplier": round(multiplier_total, 2),
            "factors": factors,
            "competitor_average": round(competitor_avg, 1),
            "confidence_interval": {
                "low": max(1, round(final_prob * 0.85, 1)),
                "high": min(99, round(final_prob * 1.15, 1))
            }
        }
