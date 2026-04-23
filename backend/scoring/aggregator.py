from typing import Dict, Any
from config import settings


class ScoreAggregator:
    """Aggregates rule-based and LLM scores into final GEO metrics."""
    
    def __init__(self):
        self.rule_weight = settings.RULE_BASED_WEIGHT
        self.llm_weight = settings.LLM_WEIGHT
    
    def aggregate(
        self,
        rule_based_scores: Dict[str, Any],
        llm_scores: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Combine scores using the Gated Scoring Architecture (60% Rule / 40% LLM).
        """
        # --- Normalize LLM Metrics (Default to 50 if missing) ---
        llm_metrics = {
            'semantic_richness': llm_scores.get('semantic_richness', 50),
            'user_intent': llm_scores.get('user_intent_alignment', 50),
            'structural_integrity': llm_scores.get('structural_integrity', 50),
            'ai_formatting': llm_scores.get('ai_friendly_formatting', 50),
            'content_authority': llm_scores.get('content_authority', 50),
            'linkability': llm_scores.get('internal_linkability', 50),
            'readability_ux': llm_scores.get('readability_ux', 50),
            'experience': llm_scores.get('experience_score', 50),
            'expertise': llm_scores.get('expertise_score', 50),
            'authoritativeness': llm_scores.get('authoritativeness_score', 50),
            'trustworthiness': llm_scores.get('trustworthiness_score', 50)
        }
        
        # --- Extract Rule-Based Metrics (The Gated Baseline) ---
        rb_structure = rule_based_scores.get('structure', {}).get('score', 50)
        rb_keywords = rule_based_scores.get('keywords', {}).get('score', 50)
        rb_authority = rule_based_scores.get('authority', {}).get('score', 50)
        rb_readability = rule_based_scores.get('readability', {}).get('score', 50)
        rb_schema = rule_based_scores.get('schema', {}).get('score', 50)
        
        auth_details = rule_based_scores.get('authority', {}).get('details', {})
        
        # --- Pillar 1: AI Visibility (Structural & Schema Integrity) ---
        # Gated by: rb_structure and rb_schema
        visibility_baseline = (rb_structure * 0.7) + (rb_schema * 0.3)
        visibility_refinement = (llm_metrics['ai_formatting'] * 0.5) + (llm_metrics['structural_integrity'] * 0.5)
        ai_visibility_score = min(max((visibility_baseline * 0.6) + (visibility_refinement * 0.4), 0), 100)
        
        # --- Pillar 2: Citation Worthiness (Trust, Authority, EEAT) ---
        # Gated by: rb_authority (citations, stats, expert mentions)
        trust_booster = min((auth_details.get('citations', 0) * 5) + (auth_details.get('fact_density', 0) * 10), 20)
        hybrid_trust = min(llm_metrics['trustworthiness'] * 0.8 + trust_booster, 100)
        
        expertise_booster = min((auth_details.get('expert_mentions', 0) * 10), 20)
        hybrid_expertise = min(llm_metrics['expertise'] * 0.8 + expertise_booster, 100)
        
        overall_eeat = (
            hybrid_trust * 0.40 +
            hybrid_expertise * 0.25 +
            llm_metrics['authoritativeness'] * 0.20 +
            llm_metrics['experience'] * 0.15
        )
        
        # Citation Gate
        citation_baseline = rb_authority
        citation_refinement = (llm_metrics['content_authority'] * 0.5) + (overall_eeat * 0.5)
        citation_worthiness_score = min(max((citation_baseline * 0.6) + (citation_refinement * 0.4), 0), 100)

        # --- Pillar 3: Semantic Coverage (Keyword Relevance & Information Gain) ---
        # Gated by: rb_keywords
        semantic_baseline = rb_keywords
        semantic_refinement = (llm_metrics['semantic_richness'] * 0.6) + (llm_metrics['user_intent'] * 0.4)
        semantic_coverage_score = min(max((semantic_baseline * 0.6) + (semantic_refinement * 0.4), 0), 100)

        # --- Pillar 4: Technical Readability (UX & Flow) ---
        # Gated by: rb_readability
        readability_baseline = rb_readability
        readability_refinement = llm_metrics['readability_ux']
        technical_readability_score = min(max((readability_baseline * 0.7) + (readability_refinement * 0.3), 0), 100)

        # --- E-commerce Specialization (Overrides) ---
        if 'product_data_completeness' in llm_scores:
            # Re-weight Semantic Coverage for Ecom
            ecom_data = llm_scores.get('product_data_completeness', 50)
            semantic_coverage_score = min(max((semantic_coverage_score * 0.7) + (ecom_data * 0.3), 0), 100)
        
        if 'review_presence' in llm_scores:
            # Re-weight Citation for Ecom
            ecom_reviews = llm_scores.get('review_presence', 50)
            citation_worthiness_score = min(max((citation_worthiness_score * 0.7) + (ecom_reviews * 0.3), 0), 100)
            
        # --- Formatting for API Response ---
        ai_details = {
            'ai_friendly_formatting': llm_metrics['ai_formatting'],
            'structural_integrity': llm_metrics['structural_integrity'],
            'rule_structure_score': rb_structure,
            'rule_schema_score': rb_schema
        }
        
        citation_details = {
            'content_authority': llm_metrics['content_authority'],
            'rule_authority_score': rb_authority,
            'citations_found': auth_details.get('citations', 0),
            'facts_density': auth_details.get('fact_density', 0)
        }
        
        semantic_details = {
            'semantic_richness': llm_metrics['semantic_richness'],
            'user_intent_alignment': llm_metrics['user_intent'],
            'rule_keyword_score': rb_keywords
        }
        
        readability_details = {
            'readability_ux': llm_metrics['readability_ux'],
            'rule_readability_score': rb_readability
        }
        
        formatted_llm_scores_response = {
            'ai_visibility': {
                'score': llm_metrics['ai_formatting'],
                'details': ai_details,
                'suggestions': []
            },
            'citation_worthiness': {
                'score': llm_metrics['content_authority'],
                'details': citation_details,
                'suggestions': []
            },
            'semantic_richness': {
                'score': llm_metrics['semantic_richness'],
                'details': semantic_details,
                'suggestions': []
            },
            'technical_readability': {
                'score': llm_metrics['readability_ux'],
                'details': readability_details,
                'suggestions': []
            }
        }

        # Collect Suggestions (Balanced Strategy: 4 LLM + 4 Rule-Based)
        final_suggestions = []
        
        # 1. LLM Suggestions (High Priority AI Opportunities)
        llm_suggestion_items = llm_scores.get('suggestions', [])
        # Fallback for old 'top_suggestion' if still coming from some cached path
        if not llm_suggestion_items and llm_scores.get('top_suggestion'):
            llm_suggestion_items = [llm_scores['top_suggestion']]
            
        for s in llm_suggestion_items[:4]:
            final_suggestions.append({
                'text': s,
                'category': 'AI Opportunity',
                'priority': 'HIGH',
                'source': 'llm'
            })
             
        # 2. Rule-Based Suggestions (Medium Priority Structural Fixes)
        # We limit these so they don't drown out the LLM insights
        rule_suggestions = []
        for metric_name, metric_data in rule_based_scores.items():
            if isinstance(metric_data, dict) and 'suggestions' in metric_data:
                for s in metric_data['suggestions']:
                    # Auto-detect priority from string
                    priority = 'MEDIUM'
                    if 'critical' in s.lower() or 'high impact' in s.lower() or 'mandatory' in s.lower():
                        priority = 'HIGH'
                    elif 'medium' in s.lower():
                        priority = 'MEDIUM'
                    elif 'low' in s.lower():
                        priority = 'LOW'
                        
                    rule_suggestions.append({
                        'text': s,
                        'category': metric_name.title(),
                        'priority': priority,
                        'source': 'rule'
                    })
        
        # Add up to 4 rule-based suggestions to the final list
        final_suggestions.extend(rule_suggestions[:4])

        # Final Intent and EEAT data extraction
        primary_intent = llm_scores.get('primary_intent', 'Informational')
        user_intent_val = llm_metrics['user_intent']
        experience_score = llm_metrics['experience']
        authoritativeness_score = llm_metrics['authoritativeness']
        trustworthiness_score = llm_metrics['trustworthiness']

        return {
            'ai_visibility_score': round(ai_visibility_score, 1),
            'citation_worthiness_score': round(citation_worthiness_score, 1),
            'semantic_coverage_score': round(semantic_coverage_score, 1),
            'technical_readability_score': round(technical_readability_score, 1),
            'rule_based_scores': rule_based_scores,
            'llm_scores': formatted_llm_scores_response,
            'suggestions': final_suggestions,
            'intent_analysis': {
                'primary_intent': primary_intent,
                'alignment_score': user_intent_val
            },
            'eeat_analysis': {
                'experience': experience_score,
                'expertise': round(hybrid_expertise, 1),
                'authoritativeness': authoritativeness_score,
                'trustworthiness': round(hybrid_trust, 1),
                'overall_eeat': round(overall_eeat, 1)
            }
        }
