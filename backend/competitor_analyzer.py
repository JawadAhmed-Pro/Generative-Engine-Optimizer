"""
Competitor Analysis Module
Compare GEO scores between user's content and competitor URLs.
"""
from typing import Dict, List, Any, Optional
from datetime import datetime
import asyncio
from search_service import SearchService
import traceback


class CompetitorAnalyzer:
    """Analyze and compare content against competitors."""

    def __init__(self, content_fetcher, rule_scorer, llm_scorer, aggregator, discovery_engine=None):
        self.content_fetcher = content_fetcher
        self.rule_scorer = rule_scorer
        self.llm_scorer = llm_scorer
        self.aggregator = aggregator
        self.discovery_engine = discovery_engine
        self.search_service = SearchService()

    async def analyze_competitor(self, url: str, content_type: str = "general") -> Dict[str, Any]:
        """
        Analyze a single competitor URL.

        Args:
            url: Competitor URL to analyze
            content_type: Type of content

        Returns:
            Analysis results for the competitor
        """
        try:
            # Fetch content asynchronously
            extracted = await self.content_fetcher.async_fetch_url(url)
            extracted['content_type'] = content_type

            # Rule-based scoring
            rule_scores = self.rule_scorer.analyze(
                extracted['content'], extracted, content_type
            )

            # LLM scoring
            llm_scores = await self.llm_scorer.analyze(
                extracted['content'], extracted
            )

            # Aggregate
            final_scores = self.aggregator.aggregate(rule_scores, llm_scores)

            return {
                "url": url,
                "title": extracted.get('title', 'Unknown'),
                "status": "success",
                "scores": {
                    "ai_visibility": final_scores['ai_visibility_score'],
                    "citation_worthiness": final_scores['citation_worthiness_score'],
                    "semantic_coverage": final_scores['semantic_coverage_score'],
                    "technical_readability": final_scores['technical_readability_score'],
                    "overall": round(
                        (final_scores['ai_visibility_score'] +
                         final_scores['citation_worthiness_score'] +
                         final_scores['semantic_coverage_score'] +
                         final_scores['technical_readability_score']) / 4, 1
                    )
                },
                "rule_based_scores": final_scores['rule_based_scores'],
                "llm_scores": final_scores['llm_scores'],
                "suggestions": final_scores['suggestions'],
                "word_count": len(extracted['content'].split()),
                "has_schema": bool(extracted.get('schema', {}).get('types', [])),
                "schema_types": extracted.get('schema', {}).get('types', []),
                "headings": extracted.get('headings', {}),
                "analyzed_at": datetime.utcnow().isoformat(),
                "raw_text_sample": extracted.get('content', '')[:1500] 
            }

        except Exception as e:
            return {
                "url": url,
                "title": "Error",
                "status": "error",
                "error": str(e),
                "scores": {
                    "ai_visibility": 0,
                    "citation_worthiness": 0,
                    "semantic_coverage": 0,
                    "technical_readability": 0,
                    "overall": 0
                }
            }

    async def compare(
        self,
        user_url: str,
        competitor_urls: List[str],
        keyword: Optional[str] = None,
        niche: str = "general",
        content_type: str = "general"
    ) -> Dict[str, Any]:
        """
        Compare user's content against multiple competitors.
        Includes semantic gap and prompt coverage analysis.
        """
        # Auto-discover opponents if none provided
        if not competitor_urls and keyword:
            competitor_urls = self.search_service.get_top_competitors(keyword, limit=3)
            
        # Limit competitors
        competitor_urls = competitor_urls[:3] # Ensure speed

        # 1. Standard competitive analysis (Concurrent)
        tasks = [self.analyze_competitor(user_url, content_type)]
        for comp_url in competitor_urls:
            tasks.append(self.analyze_competitor(comp_url, content_type))
            
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        user_result = results[0] if not isinstance(results[0], Exception) else {"status": "error", "error": "Failed user"}
        
        competitor_results = []
        for res in results[1:]:
            if isinstance(res, Exception):
                # Handle exception and continue
                pass
            elif res.get('status') == 'success':
                competitor_results.append(res)

        # 2. Prompt Discovery & Coverage Gap (The "Killer Feature")
        prompt_coverage = {}
        if self.discovery_engine and keyword:
            discovery = await self.discovery_engine.discover_prompts(keyword, niche)
            prompts = discovery.get('top_prompts', [])[:10]
            
            # Analyze coverage for user and top competitor
            prompt_coverage = await self._analyze_prompt_coverage(
                user_result, 
                competitor_results, 
                prompts
            )

        # Generate comparison insights
        comparison = self._generate_comparison(user_result, competitor_results)
        
        # 3. Deep Semantic Gap Analysis via LLM
        semantic_gap_markdown = "No competitors found."
        if competitor_results and user_result.get('status') == 'success':
            comp_texts = [c.get('raw_text_sample', '') for c in competitor_results]
            user_text = user_result.get('raw_text_sample', '')
            semantic_gap_markdown = await self.llm_scorer.find_semantic_gaps(user_text, comp_texts)
            
        comparison['semantic_gaps'] = semantic_gap_markdown
        
        if prompt_coverage:
            comparison['prompt_coverage'] = prompt_coverage

        # Remove raw text before returning to client to save bandwidth
        if 'raw_text_sample' in user_result: del user_result['raw_text_sample']
        for comp in competitor_results:
            if 'raw_text_sample' in comp: del comp['raw_text_sample']

        return {
            "user": user_result,
            "competitors": competitor_results,
            "comparison": comparison,
            "analyzed_at": datetime.utcnow().isoformat()
        }

    async def _analyze_prompt_coverage(self, user: Dict[str, Any], competitors: List[Dict[str, Any]], prompts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze which prompts are covered by whom and where the grounding gaps are."""
        coverage_results = []
        
        for p in prompts:
            p_text = p['prompt']
            # Simple heuristic coverage check (in real production, this would be another LLM pass)
            user_text = str(user.get('headings', {})) + str(user.get('title', ''))
            comp_best_text = ""
            best_comp_url = ""
            
            if competitors:
                best_comp = competitors[0]
                comp_best_text = str(best_comp.get('headings', {})) + str(best_comp.get('title', ''))
                best_comp_url = best_comp.get('url', '')

            user_has = any(word.lower() in user_text.lower() for word in p_text.split() if len(word) > 4)
            comp_has = any(word.lower() in comp_best_text.lower() for word in p_text.split() if len(word) > 4)

            coverage_results.append({
                "prompt": p_text,
                "user_coverage": "High" if user_has else "None",
                "competitor_coverage": "High" if comp_has else "None",
                "gap": not user_has and comp_has,
                "winning_url": best_comp_url if comp_has and not user_has else (user['url'] if user_has else "Neither")
            })

        return {
            "top_prompts": coverage_results,
            "citation_gap_score": sum(1 for r in coverage_results if r['gap'])
        }

    def _generate_comparison(
        self,
        user: Dict[str, Any],
        competitors: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate comparison insights and quick wins."""
        if user.get("status") == "error":
            return {"error": "User content analysis failed"}

        valid_competitors = [c for c in competitors if c.get("status") != "error"]
        if not valid_competitors:
            return {"error": "No valid competitor analyses"}

        user_scores = user["scores"]

        # Calculate averages
        avg_scores = {
            "ai_visibility": 0,
            "citation_worthiness": 0,
            "semantic_coverage": 0,
            "technical_readability": 0,
            "overall": 0
        }

        for comp in valid_competitors:
            for key in avg_scores:
                avg_scores[key] += comp["scores"].get(key, 0)

        for key in avg_scores:
            avg_scores[key] = round(avg_scores[key] / len(valid_competitors), 1)

        # Find gaps (where user is behind)
        gaps = []
        strengths = []
        quick_wins = []

        score_labels = {
            "ai_visibility": "AI Visibility",
            "citation_worthiness": "Citation Worthiness",
            "semantic_coverage": "Semantic Coverage",
            "technical_readability": "Technical Readability"
        }

        for key, label in score_labels.items():
            user_score = user_scores.get(key, 0)
            avg_score = avg_scores.get(key, 0)
            diff = round(user_score - avg_score, 1)

            if diff < -10:
                gaps.append({
                    "metric": label,
                    "your_score": user_score,
                    "competitor_avg": avg_score,
                    "gap": abs(diff),
                    "priority": "high" if abs(diff) > 20 else "medium"
                })
            elif diff > 10:
                strengths.append({
                    "metric": label,
                    "your_score": user_score,
                    "competitor_avg": avg_score,
                    "advantage": diff
                })

        # Generate quick wins based on rule-based analysis
        user_rules = user.get("rule_based_scores", {})
        for comp in valid_competitors:
            comp_rules = comp.get("rule_based_scores", {})
            for metric_name, comp_metric in comp_rules.items():
                user_metric = user_rules.get(metric_name, {})
                user_score_val = user_metric.get("score", 0) if isinstance(user_metric, dict) else 0
                comp_score_val = comp_metric.get("score", 0) if isinstance(comp_metric, dict) else 0

                if comp_score_val > user_score_val + 20:
                    # Competitor is significantly better in this area
                    comp_suggestions = comp_metric.get("suggestions", []) if isinstance(comp_metric, dict) else []
                    user_suggestions = user_metric.get("suggestions", []) if isinstance(user_metric, dict) else []

                    win = {
                        "area": metric_name.replace("_", " ").title(),
                        "your_score": user_score_val,
                        "competitor_score": comp_score_val,
                        "competitor_url": comp.get("url", ""),
                        "what_they_do": f"Competitor scores {comp_score_val} vs your {user_score_val}",
                        "suggestions": user_suggestions[:2]
                    }
                    # Avoid duplicates
                    if not any(w["area"] == win["area"] for w in quick_wins):
                        quick_wins.append(win)

        # Sort gaps by severity
        gaps.sort(key=lambda x: x["gap"], reverse=True)
        quick_wins.sort(key=lambda x: x["competitor_score"] - x["your_score"], reverse=True)

        # Check specific features competitors have
        feature_gaps = []
        user_has_schema = user.get("has_schema", False)
        user_word_count = user.get("word_count", 0)

        for comp in valid_competitors:
            if comp.get("has_schema") and not user_has_schema:
                if not any(f["feature"] == "Schema Markup" for f in feature_gaps):
                    feature_gaps.append({
                        "feature": "Schema Markup",
                        "impact": "high",
                        "message": f"Competitor ({comp['url'][:40]}...) has schema markup ({', '.join(comp.get('schema_types', [])[:3])}), you don't",
                        "fix": "Add structured data (Article, FAQ, or Product schema)"
                    })

            comp_word_count = comp.get("word_count", 0)
            if comp_word_count > user_word_count * 1.5:
                if not any(f["feature"] == "Content Length" for f in feature_gaps):
                    feature_gaps.append({
                        "feature": "Content Length",
                        "impact": "medium",
                        "message": f"Competitor has {comp_word_count} words vs your {user_word_count}",
                        "fix": "Expand content with more depth, examples, and data"
                    })

        return {
            "your_overall": user_scores.get("overall", 0),
            "competitor_avg_overall": avg_scores["overall"],
            "position": "ahead" if user_scores.get("overall", 0) > avg_scores["overall"] else "behind",
            "score_difference": round(user_scores.get("overall", 0) - avg_scores["overall"], 1),
            "gaps": gaps[:5],
            "strengths": strengths[:5],
            "quick_wins": quick_wins[:5],
            "feature_gaps": feature_gaps[:5],
            "total_competitors_analyzed": len(valid_competitors)
        }
