import asyncio
import os
from competitor_analyzer import CompetitorAnalyzer
from content_fetcher import ContentFetcher
from scoring.rule_based import RuleBasedScorer
from scoring.llm_scorer import LLMScorer
from scoring.aggregator import ScoreAggregator

async def test_competitor():
    fetcher = ContentFetcher()
    rule_scorer = RuleBasedScorer()
    llm_scorer = LLMScorer()
    aggregator = ScoreAggregator()
    
    analyzer = CompetitorAnalyzer(fetcher, rule_scorer, llm_scorer, aggregator)
    
    print("Testing competitor analysis for 'how to optimize for GEO'...")
    try:
        # Use a real URL and a keyword
        results = await analyzer.compare(
            user_url="https://www.google.com", # placeholder
            competitor_urls=[],
            keyword="budget travel tips 2026",
            niche="travel"
        )
        print("Results keys:", results.keys())
        if "competitors" in results:
            print(f"Found {len(results['competitors'])} competitors.")
        else:
            print("No competitors found in results.")
    except Exception as e:
        print(f"Error during analysis: {e}")

if __name__ == "__main__":
    asyncio.run(test_competitor())
