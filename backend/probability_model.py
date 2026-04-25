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
        content_type: str = "general",
        engine: str = "perplexity"
    ) -> Dict[str, Any]:
        """
        Calculates citation probability with department-specific logic.
        Recognizes 'evergreen' educational content to avoid unfair decay penalties.
        """
        # 0. CATEGORY AUTO-DETECTION (Internal)
        detected_category = content_type
        
        # Extract metadata for detection
        content_text = llm_scores.get('raw_content', '').lower()
        target_kw = llm_scores.get('target_keyword', '').lower()
        llm_authority = llm_scores.get('citation_worthiness', {}).get('score', 0)
        
        if content_type == 'general':
            scientific_keywords = ['algorithm', 'classification', 'neural', 'theory', 'mathematics', 'foundation', 'research', 'deep learning', 'science', 'academic']
            
            # Detect based on keyword presence in text or target keyword
            has_sci_kw = any(kw in content_text for kw in scientific_keywords) or any(kw in target_kw for kw in scientific_keywords)
            
            # Detect based on high authority signals (LLM or Rule-based)
            is_highly_authoritative = llm_authority > 75 or rule_scores.get('authority', {}).get('score', 0) > 70
            
            if has_sci_kw or is_highly_authoritative:
                detected_category = 'educational'

        # 1. BASE PROBABILITY CALIBRATION
        if overall_score < 40:
            base_prob = overall_score * 0.4
        elif overall_score < 75:
            base_prob = 16 + ((overall_score - 40) * 1.3)
        else:
            base_prob = 61 + ((overall_score - 75) * 1.5)
            
        base_prob = max(1.0, min(90.0, base_prob))

        factors: List[Dict[str, Any]] = []
        multiplier_total = 1.0

        # 2. FRESHNESS FACTOR (Decay Curve)
        freshness_data = rule_scores.get('freshness', {})
        last_updated_year = freshness_data.get('details', {}).get('extracted_year', 2026)
        is_evergreen = freshness_data.get('details', {}).get('is_evergreen', False)
        
        def get_freshness_factor(year, evergreen):
            if evergreen: return 1.0
            current_year = 2026
            age = current_year - year
            if age <= 1:   return 1.0
            elif age <= 2: return 0.85
            elif age <= 3: return 0.70
            return 0.55 # age >= 4
            
        decay_multiplier = get_freshness_factor(last_updated_year, is_evergreen)
        
        if decay_multiplier < 1.0:
            multiplier_total *= decay_multiplier
            penalty_pct = int((1.0 - decay_multiplier) * 100)
            factors.append({
                "factor": "Freshness Factor",
                "impact": f"-{penalty_pct}%",
                "type": "negative",
                "description": f"Content age ({2026 - last_updated_year} years) impacts extraction confidence. Update to 2026 standards to restore full score."
            })
        else:
            factors.append({
                "factor": "Freshness Factor",
                "impact": "100%",
                "type": "positive",
                "description": "Content is evergreen or recently updated."
            })

        # 3. AUTHORITY & DEPTH LIFTS (High impact for Education)
        auth_data = rule_scores.get('authority', {}).get('details', {})
        expert_mentions = auth_data.get('expert_mentions', 0)
        
        # Bridge the gap: If LLM says highly authoritative but rule missed specific quotes
        if expert_mentions == 0 and llm_authority > 80 and detected_category == 'educational':
            expert_mentions = 1.5 # Hybrid credit for expert-level quality

        if expert_mentions > 0:
            # Education gets 2x the lift from authority vs Commerce
            auth_lift = 1.2 + (expert_mentions * 0.1) if detected_category == 'educational' else 1.1 + (expert_mentions * 0.05)
            auth_lift = min(1.65, auth_lift)
            multiplier_total *= auth_lift
            factors.append({
                "factor": "Authoritative Depth",
                "impact": f"+{int((auth_lift-1)*100)}%",
                "type": "positive",
                "description": "Expert signals or high academic authority detected."
            })

        # 4. DATA & STATS
        stats = auth_data.get('statistics', 0)
        if stats >= 3:
            stat_lift = 1.25
            multiplier_total *= stat_lift
            factors.append({
                "factor": "Empirical Weight",
                "impact": "+25%",
                "type": "positive",
                "description": "Verifiable numbers increase extraction confidence."
            })

        # 5. SCHEMA (High impact for Commerce)
        schema_data = rule_scores.get('schema', {}).get('details', {})
        schema_types = schema_data.get('schema_types', [])
        if 'Product' in schema_types or 'FAQPage' in schema_types:
            schema_lift = 1.4 if detected_category == 'ecommerce' else 1.2
            multiplier_total *= schema_lift
            factors.append({
                "factor": "Structured Extraction",
                "impact": f"+{int((schema_lift-1)*100)}%",
                "type": "positive",
                "description": "Valid schema allows AI to parse facts without hallucination risk."
            })

        # Phase 3: ENGINE-SPECIFIC RECALIBRATION (Dynamic RSS Thresholds)
        if engine == "perplexity":
            # Perplexity heavily favors explicit facts and citations
            if stats >= 3 or expert_mentions >= 1:
                perplexity_lift = 1.25
                multiplier_total *= perplexity_lift
                factors.append({"factor": "Perplexity Density Bias", "impact": "+25%", "type": "positive", "description": "High factual density aligns with Perplexity retrieval algorithms."})
        
        elif engine == "chatgpt":
            # ChatGPT heavily favors readability and conversational flow (Semantic Richness)
            readability_data = rule_scores.get('readability', {})
            flesch_score = readability_data.get('details', {}).get('flesch_score', 0)
            if 60 <= flesch_score <= 80:
                gpt_lift = 1.15
                multiplier_total *= gpt_lift
                factors.append({"factor": "ChatGPT Flow Bias", "impact": "+15%", "type": "positive", "description": "Conversational readability matches OpenAI's synthesis preference."})
                
        elif engine == "google_sge":
            # Google relies on traditional PageRank and strict technical SEO as pre-filters
            has_schema = len(schema_types) > 0
            if not has_schema:
                sge_penalty = 0.70
                multiplier_total *= sge_penalty
                factors.append({"factor": "Google Pre-Filter Penalty", "impact": "-30%", "type": "negative", "description": "Missing schema fails Google's technical pre-retrieval filters."})

        # Phase 4: DETERMINISTIC GATE FLOOR (Mathematical Floor)
        # If the hard-gated baseline is failed, probability must decay
        rb_authority = rule_scores.get('authority', {}).get('score', 0)
        rb_structure = rule_scores.get('structure', {}).get('score', 0)
        
        gate_penalty = 1.0
        if rb_authority < 25:
            # Fact Gate Failed
            gate_penalty *= 0.4
            factors.append({
                "factor": "Fact-Density Gate Failure",
                "impact": "-60%",
                "type": "negative",
                "description": "Critical: Content lacks verifiable statistics or expert grounding required for AI search extraction."
            })
        
        if rb_structure < 30:
            # Structure Gate Failed
            gate_penalty *= 0.5
            factors.append({
                "factor": "Structural Integrity Failure",
                "impact": "-50%",
                "type": "negative",
                "description": "AI engines penalize content without clear hierarchy or semantic formatting (H1/H2/Lists)."
            })

        # Calculate Final Probability
        final_prob = base_prob * multiplier_total * gate_penalty
        
        # Absolute Floor for zero-fact content
        if rb_authority == 0 and rb_structure < 20:
            final_prob = min(final_prob, 5.0)

        # Final Cap
        final_prob = max(1.0, min(95.0, final_prob))
        
        # Calculate Confidence Score (based on data completeness)
        confidence = 0.5
        if stats > 0: confidence += 0.2
        if expert_mentions > 0: confidence += 0.2
        if len(schema_types) > 0: confidence += 0.1
        
        # Competitor average calibrated to the niche
        competitor_base = {"educational": 45, "ecommerce": 20, "general": 30}.get(detected_category, 30)
        competitor_avg = max(competitor_base, final_prob * 0.7)

        return {
            "probability": round(final_prob, 1),
            "base_probability": round(base_prob, 1),
            "confidence_score": round(min(1.0, confidence), 2),
            "multiplier": round(multiplier_total * gate_penalty, 2),
            "factors": factors,
            "engine": engine,
            "category": detected_category,
            "competitor_average": round(competitor_avg, 1),
            "confidence_interval": {
                "low": max(1, round(final_prob - 10.0, 1)),
                "high": min(99, round(final_prob + 10.0, 1))
            }
        }
