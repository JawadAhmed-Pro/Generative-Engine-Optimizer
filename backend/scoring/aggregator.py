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
        Combine scores. 
        Note: `llm_scores` now contains the specific 7 or 12 metrics from the LLM.
        """
        # --- Extract LLM Metrics (with defaults) ---
        semantic_richness = llm_scores.get('semantic_richness', 50)
        user_intent = llm_scores.get('user_intent_alignment', 50)
        structural_integrity = llm_scores.get('structural_integrity', 50)
        ai_formatting = llm_scores.get('ai_friendly_formatting', 50)
        content_authority = llm_scores.get('content_authority', 50)
        linkability = llm_scores.get('internal_linkability', 50)
        readability_ux = llm_scores.get('readability_ux', 50)
        
        # --- Extract New Functional Metrics ---
        primary_intent = llm_scores.get('primary_intent', 'Informational')
        experience_score = llm_scores.get('experience_score', 50)
        expertise_score = llm_scores.get('expertise_score', 50)
        authoritativeness_score = llm_scores.get('authoritativeness_score', 50)
        trustworthiness_score = llm_scores.get('trustworthiness_score', 50)
        
        # --- Rule-Based Metrics ---
        rb_structure = rule_based_scores.get('structure', {}).get('score', 50)
        rb_keywords = rule_based_scores.get('keywords', {}).get('score', 50)
        rb_authority = rule_based_scores.get('authority', {}).get('score', 50)
        rb_readability = rule_based_scores.get('readability', {}).get('score', 50)

        # --- Mapping New Metrics to Old DB Columns ---
        
        # 1. AI Visibility Score
        # Maps to: AI-Friendly Formatting, Structural Integrity, Schema/Formatting
        ai_visibility_score = (
            ai_formatting * 0.45 +
            structural_integrity * 0.45 +
            rb_structure * 0.1
        )
        
        # 2. Citation Worthiness Score
        # Maps to: Content Authority, Internal Linking, Reviews (if ecom)
        citation_worthiness_score = (
            content_authority * 0.6 +
            linkability * 0.3 +
            rb_authority * 0.1
        )
        # Adjust for ecommerce if present
        if 'review_presence' in llm_scores:
             citation_worthiness_score = (
                content_authority * 0.4 +
                linkability * 0.2 +
                llm_scores['review_presence'] * 0.3 + 
                rb_authority * 0.1
            )

        # 3. Semantic Coverage Score
        # Maps to: Semantic Richness, User Intent, Product Data (if ecom)
        semantic_coverage_score = (
            semantic_richness * 0.5 +
            user_intent * 0.4 +
            rb_keywords * 0.1
        )
        if 'product_data_completeness' in llm_scores:
             semantic_coverage_score = (
                semantic_richness * 0.35 +
                user_intent * 0.35 +
                llm_scores['product_data_completeness'] * 0.2 + 
                rb_keywords * 0.1
            )

        # 4. Technical Readability Score
        # Maps to: Readability & UX, CTA (if ecom)
        technical_readability_score = (
            readability_ux * 0.8 +
            rb_readability * 0.2
        )
        if 'cta_clarity' in llm_scores:
            technical_readability_score = (
                readability_ux * 0.6 +
                llm_scores['cta_clarity'] * 0.3 +
                rb_readability * 0.1
            )
            
        # --- Formatting for API Response ---
        # Only include details that actually exist in the LLM response
        
        ai_details = {
            'ai_friendly_formatting': ai_formatting,
            'structural_integrity': structural_integrity,
        }
        if 'product_schema' in llm_scores:
             ai_details['product_schema'] = llm_scores['product_schema']

        citation_details = {
            'content_authority': content_authority,
            'internal_linkability': linkability,
        }
        if 'review_presence' in llm_scores:
            citation_details['review_presence'] = llm_scores['review_presence']

        semantic_details = {
            'semantic_richness': semantic_richness,
            'user_intent_alignment': user_intent,
        }
        if 'product_data_completeness' in llm_scores:
            semantic_details['product_data_completeness'] = llm_scores['product_data_completeness']
        if 'inventory_shipping' in llm_scores:
            semantic_details['inventory_shipping'] = llm_scores['inventory_shipping']

        readability_details = {
            'readability_ux': readability_ux,
        }
        if 'cta_clarity' in llm_scores:
            readability_details['cta_clarity'] = llm_scores['cta_clarity']

        
        formatted_llm_scores_response = {
            'ai_visibility': {
                'score': ai_formatting,
                'details': ai_details,
                'suggestions': []
            },
            'citation_worthiness': {
                'score': content_authority,
                'details': citation_details,
                'suggestions': []
            },
            'semantic_richness': {
                'score': semantic_richness,
                'details': semantic_details,
                'suggestions': []
            },
            'technical_readability': {
                'score': readability_ux,
                'details': readability_details,
                'suggestions': []
            }
        }

        # Collect Suggestions
        suggestions = []
        if 'top_suggestion' in llm_scores and llm_scores['top_suggestion']:
             suggestions.append({
                'text': llm_scores['top_suggestion'],
                'category': 'AI Opportunity',
                'priority': 'HIGH',
                'source': 'llm'
            })
             
        # Add rule based suggestions
        for metric_name, metric_data in rule_based_scores.items():
            if isinstance(metric_data, dict) and 'suggestions' in metric_data:
                for s in metric_data['suggestions']:
                    suggestions.append({
                        'text': s,
                        'category': metric_name.title(),
                        'priority': 'MEDIUM',
                        'source': 'rule'
                    })

        return {
            'ai_visibility_score': round(ai_visibility_score, 1),
            'citation_worthiness_score': round(citation_worthiness_score, 1),
            'semantic_coverage_score': round(semantic_coverage_score, 1),
            'technical_readability_score': round(technical_readability_score, 1),
            'rule_based_scores': rule_based_scores,
            'llm_scores': formatted_llm_scores_response,
            'suggestions': suggestions[:8],
            'intent_analysis': {
                'primary_intent': primary_intent,
                'alignment_score': user_intent
            },
            'eeat_analysis': {
                'experience': experience_score,
                'expertise': expertise_score,
                'authoritativeness': authoritativeness_score,
                'trustworthiness': trustworthiness_score,
                'overall_eeat': round((experience_score + expertise_score + authoritativeness_score + trustworthiness_score) / 4, 1)
            }
        }
